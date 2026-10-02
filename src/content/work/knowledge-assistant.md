---
order: 1
project: "Knowledge Assistant"
title: "A document assistant that knows when it doesn’t know"
summary: "Ask about something the document never mentions and most RAG tools answer anyway. This one refuses before the model is called, at a threshold I measured on a gold set, and checks every citation after."
kind: Personal project
period: "Aug – Sep 2026"
ownership: "Solo — design, build, evaluation, deployment"
status: Live
proof:
  - 0.826 recall@3
  - refuses below 0.55
  - 28-question gold set
tldr:
  - "Problem: RAG tools answer confidently even when the document doesn’t contain the answer."
  - "Decision: a deterministic evidence gate before generation, with the cutoff taken from measured scores, plus citation checks after."
  - "Result: live on Vercel; 0.826 recall@3 on a 28-question gold set, with the main design choices decided by measured comparisons."
metrics:
  - value: "0.826"
    label: recall@3 on the 28-question gold set
  - value: "< 0.55"
    label: refused without calling the model
  - value: 0.826 vs 0.783
    label: sentence chunker vs recursive, A/B
  - value: 0.83 vs 0.61
    label: bge-small vs MiniLM embeddings
pipeline:
  - { step: Extract, kind: step, note: layout-aware PDF }
  - { step: Chunk, kind: step, note: whole sentences }
  - { step: Retrieve, kind: step, note: recall@3 0.826 }
  - { step: Evidence gate, kind: check, note: refuse < 0.55 }
  - { step: Generate, kind: model, note: Claude or Gemini }
  - { step: Check citations, kind: check, note: invalid ones removed }
pipelineCaption: "The model is one stage. The two checks around it decide whether it runs at all, and what of its answer survives."
decisions:
  - decision: When to refuse
    alternatives: Let the model decide from the prompt; pick a cutoff that looks reasonable
    chose: A gate before any model call, at 0.55
    evidence: absent ≤ 0.506 (one outlier) · answerable ≥ 0.622
  - decision: How to chunk
    alternatives: Recursive-separator chunker
    chose: Whole sentences, ~500 chars, linked to neighbours
    evidence: recall@3 0.826 vs 0.783
  - decision: Which embeddings
    alternatives: all-MiniLM-L6-v2
    chose: bge-small (384-d)
    evidence: recall@3 0.83 vs 0.61
  - decision: Citations
    alternatives: Trust the model to cite correctly
    chose: Check every label after generation; strip the invalid ones
    evidence: caught [S999]-style citations slipping through
  - decision: Fallbacks
    alternatives: Silently switch provider when one fails
    chose: Embeddings fall back only at indexing; the answering model never does
    evidence: you always know which model answered
  - decision: Serverless fit
    alternatives: Keep FAISS and local PyTorch
    chose: Exact NumPy search, embeddings over an API
    evidence: same results at this scale · ~650 MB removed
stack:
  - Python
  - FastAPI
  - PyMuPDF
  - NumPy
  - PostgreSQL (Supabase)
  - Next.js
  - Vercel
  - Claude / Gemini APIs
links:
  - label: Live demo
    href: https://rag-ivory-phi.vercel.app
  - label: Code
    href: https://github.com/labdhishahp/rag
---

## The problem

Most “chat with your document” tools fail the same way. Ask about something the document never mentions and they answer anyway, fluently and wrongly. For anything you’d actually rely on, that’s worse than no answer.

So I set two requirements. Every claim has to trace back to a passage you can read. And the system needs a principled way to decide there isn’t enough evidence to answer, before the model gets the chance to improvise.

## Constraints

- **Serverless on Vercel:** small functions and a 4.5 MB request limit, so uploads are capped at 4 MB.
- **Quota-limited model APIs:** every extra model call had to earn its place.
- **One document per session:** retrieval quality, not corpus size, decides whether an answer is grounded.

## The decisions

### Refuse before generating

I wrote a gold set of 28 questions: 23 the documents can answer, 5 whose answers are deliberately absent. Then I recorded the best retrieval score each question got. With bge-small embeddings, the absent questions topped out at `0.506` and the weakest answerable one scored `0.622`. The hard floor sits in that gap, at `0.55`. Below it, the system refuses without calling the model; between `0.55` and `0.65` it answers but flags low confidence.

A refusal that depends on how a model reads a prompt can’t be tested. A threshold can. Scores from different embedding models aren’t comparable, so the floors are stored per model (Gemini’s are `0.60` and `0.70`).

**What it couldn’t catch:** one absent question, asking for a company’s stock price, scored `0.758`. No threshold separates it, so the prompt also carries an explicit refusal rule. The gate is the first line, not the only one.

### Check citations instead of asking for them

Every passage sent to the model is labelled `[S1]`, `[S2]` and so on. After generation, each label in the answer is checked against the ones that were provided, and anything citing a passage that doesn’t exist is removed. In comparisons, each side gets its own labels (`[A#]`, `[B#]`) so a claim about one side can’t cite the other’s evidence. Writing this check found a real bug: three-digit citations like `[S999]` had been slipping past.

### Keep the chunker that measured better

Chunks are whole sentences packed into about 500 characters with a 50-character overlap, each carrying its section, page, offsets and links to its neighbours. Against a recursive-separator chunker on the same gold set it scored `0.826` recall@3 against `0.783`. Both got the right passage into the context equally often; the sentence chunker ranked it higher.

### Let question depth change retrieval

Brief, normal and detailed questions retrieve different amounts of evidence, not just different answer lengths. Brief questions search wider (top 5) because of one measured failure: a short question was refused when its answer ranked fourth. I rejected an LLM classifier for this: one more call against the quota, and a decision I couldn’t inspect.

### Fall back for embeddings, never for the answer

If the primary embedding model is down, the fallback is used only when a document is first indexed, and the provider is recorded on it, because vectors from two models live in different spaces. The answering model never falls back: you pick Claude or Gemini, and if it’s unavailable you get an error that names it.

### Fit the platform

The first prototype was Streamlit, FAISS and local sentence-transformers. To deploy serverless I replaced FAISS with exact cosine search in NumPy (same results at single-document scale) and moved embeddings to an API, which removed roughly 650 MB of PyTorch. Vectors live in Postgres, and the FastAPI backend has no public route: the browser only talks to the Next.js server, which adds the API key.

## How I checked it

| What | Result | What it shows |
| --- | --- | --- |
| Retrieval on the gold set | recall@3 `0.826` | The right passage is usually in the top three |
| Sentence vs recursive chunker | `0.826` vs `0.783` | Chunk shape changes ranking, not just recall |
| bge-small vs all-MiniLM-L6-v2 | `0.83` vs `0.61` | The embedding model was the biggest single lever |
| Task routing (answer / summarize / compare) | `15 / 15` | Requests reach the right path without an LLM classifier |
| Score gap, absent vs answerable | `≤ 0.506` vs `≥ 0.622` | A clean place for the refusal line, apart from one outlier at `0.758` |

The evaluation itself makes no model calls, so it’s cheap to re-run.

## What’s limited

- **One weakness, plainly:** most of these runs are recorded in commit messages rather than a results file you can re-run from a fresh clone. It’s the first thing I’d fix.
- One document per session; multi-document support is on a branch, not merged.
- Exact search is linear in the number of chunks: right for one document, wrong for a library.
- Twenty-eight questions is a small gold set. The thresholds fit these documents, not every document.

## What I took from it

> Refusing well is a retrieval problem before it’s a prompting problem.
