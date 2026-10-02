---
order: 2
project: "L-Mart · AI loyalty operations"
title: "An AI analyst that can investigate and propose, but never decide"
summary: "A model investigates why a loyalty programme is slipping and drafts a campaign. Deterministic policy code checks it twice, a person approves the exact content, and everything lands in an audit log."
kind: Personal project
period: "Sep 2026 – present"
ownership: "Personal project — design, build, evaluation"
status: In development
proof:
  - policy checked twice
  - hash-bound approvals
  - 216 tests
tldr:
  - "Problem: once a model can act, not just answer, the real question is what it should be allowed to do on its own."
  - "Decision: the model only asks questions and interprets answers; typed tools, policy code and a human approval decide everything else."
  - "Result: a working agent loop with approvals and audit; graded against causes I planted and measured first — 14/22 on its first scored run."
metrics:
  - value: "+18.7 pp"
    label: largest planted cause, measured by ablation
  - value: "14 / 22"
    label: agent’s first scored run — a baseline
  - value: "0.955"
    label: recall@3, date-aware policy retrieval
  - value: "216"
    label: automated tests, none calls a model
pipeline:
  - { step: Plan, kind: model }
  - { step: Typed tools, kind: step, note: 11 SQL metrics }
  - { step: Findings, kind: model }
  - { step: Policy check, kind: check, note: runs twice }
  - { step: Human approval, kind: check, note: bound to content }
  - { step: Execute, kind: check, note: idempotent }
  - { step: Audit log, kind: check, note: append-only }
pipelineCaption: "The model works in the dashed steps. Everything after its findings is code or a person."
decisions:
  - decision: Data access
    alternatives: Let the model write SQL
    chose: One registry of 10 typed tools over 11 hand-written SQL metrics
    evidence: every number traces to a query I can test
  - decision: Business rules
    alternatives: Put the rules in the prompt
    chose: Rules in one code module, checked at proposal and again at execution
    evidence: unit-tested; policy docs generated from the same module
  - decision: Approval
    alternatives: Approve a request id
    chose: Approve a hash of the proposal’s content
    evidence: editing after approval invalidates it
  - decision: Serverless runs
    alternatives: One long request per investigation
    chose: One model turn per request, state rebuilt from Postgres
    evidence: fits the 60 s limit; runs resume and replay
  - decision: Ground truth
    alternatives: Trust the causes I designed
    chose: Measure each planted cause by counterfactual ablation
    evidence: points expiry measured as noise → red herring
  - decision: Policy retrieval
    alternatives: Plain vector search
    chose: Filter by country and dates first, then fuse full-text and vector
    evidence: recall@3 0.955 on 22 questions
stack:
  - Python
  - FastAPI
  - PostgreSQL + pgvector (Supabase)
  - Supabase Auth
  - Model Context Protocol
  - Next.js
  - Claude API
links:
  - label: Code
    href: https://github.com/labdhishahp/ai_loyalty
linkNote: "The live demo will be linked here after the first deployment."
---

## The problem

A question like *“Why has engagement among Gold members in the UK dropped over the last three months?”* is usually answered by an analyst with SQL and a lot of context. A model can do real parts of that work. But the moment it can also act, launching a campaign or changing an offer, the question stops being “can it answer?” and becomes “what should it be allowed to do on its own?”

L-Mart is a fictional retailer with a synthetic loyalty programme that I built to work through that end to end: investigation, recommendation, and the controls around acting on it.

## The rule everything follows

The model chooses which questions to ask and how to interpret the answers. It never computes a number, writes SQL, decides what’s allowed, or writes to business tables directly. Every decision below follows from that.

## The decisions

### Tools, not a database

The agent reaches data only through a registry of ten typed tools, built without an agent framework: validated arguments, a statement timeout on every call, one standard result shape. Behind them are eleven hand-written, versioned SQL metric definitions. Write tools aren’t even shown to the model unless the run is allowed to write. The model can misread a result, but it can’t invent a metric.

### Policy in code, checked twice

Discount ceilings by tier, at most two contacts a week, audience size limits, a required holdout, senior approval above a threshold: all of it lives in one module. The validator runs when a proposal is created and again at execution, against the data as it is then. The policy documents the agent reads are generated from the same module, so what it’s told and what’s enforced can’t drift.

### Approve the content, not the request

An approval is bound to a hash of the proposal’s content, so editing the offer afterwards invalidates it. Execution is idempotent, so a retry can’t send a campaign twice, and every step goes to an append-only audit log. Roles come from Supabase Auth, with row-level security as a second layer. Sends are simulated; no real customer is contacted.

### One model turn per request

Vercel functions stop at 60 seconds and an investigation takes several model turns. Each request advances a run by exactly one turn, and the conversation is rebuilt from stored steps every time. A time-limited claim stops two requests advancing the same run at once. Budgets for steps, tokens and cost are fixed when a run starts, and model calls time out at 50 seconds so the code reports a timeout instead of the platform killing it.

### Measure the ground truth first

To grade an investigation you need the right answer. The data generator plants causes on purpose, and I measured each one by counterfactual ablation: regenerate the data with that mechanism switched off, averaged over five seeds, and see how much of the drop disappears.

| Planted mechanism | Measured effect | What it shows |
| --- | --- | --- |
| February tier review | `+18.7 pp` | The largest cause, and a composition effect |
| Reactivation programme stopped | `+12.4 pp` | Real, but not the biggest |
| Beauty category stockout | `+7.8 pp` | Real and smaller |
| Points-expiry change | `+2.3 / −3.7 pp` (sd ≈ `2.8`) | Noise. I had designed it as a cause; it became a red herring |

### Retrieve policy with dates in mind

Policies change, so retrieval filters on country and effective dates first (a withdrawn policy can’t be cited as current), then combines full-text and vector search with reciprocal rank fusion. Fixing jurisdiction filtering and capping chunks per document raised recall@3 from `0.727` to `0.955` on a 22-question set.

### MCP as an adapter

The same tool registry is exposed over the Model Context Protocol so other clients can use it. The agent itself calls the registry directly, so its full tool trace stays in one place.

## How I checked it

- **A deterministic grader** scores each stored investigation against criteria written for that question. No model grades another model.
- **The agent scored 14 / 22 on its first scored run** and didn’t identify the largest cause. That’s a baseline, and the kind of miss the benchmark exists to catch.
- **The grader had a bug of its own:** at first every run was scored against the headline question’s rubric. Runs with no matching rubric are now reported as unscored.
- **216 automated tests**, none of which calls a model; a scripted fake provider stands in.

## What’s limited

- Still in development; the first deployment is in progress.
- One scored run per question, so no variance data yet.
- The grader matches key facts in text, which is crude.
- An adapter for OpenAI-compatible gateways exists and is tested against a fake, but hasn’t made a live call.

## What I took from it

> The useful question isn’t whether the model is smart enough. It’s which decisions it should never be the one making.
