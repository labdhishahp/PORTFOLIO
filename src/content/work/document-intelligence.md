---
order: 3
project: "Document intelligence · Miscot Systems"
title: "OCR is a pipeline, not a model"
summary: "During my internship I built an OCR pipeline for printed documents, benchmarked it against DocTR, added field detection and Aadhaar masking, and exposed it all to other services through FastAPI."
kind: Internship
period: "Dec 2025 – Feb 2026 · Mumbai"
ownership: "Software Developer Intern, Python team — image processing and OCR pipeline, backend integration"
status: Internship
proof:
  - PaddleOCR (DBNet + PARSeq)
  - benchmarked against DocTR
  - Aadhaar masking
tldr:
  - "Problem: take an uploaded document, find the fields that matter, read them reliably, and never expose sensitive data on the way."
  - "My part: the OCR pipeline and its preprocessing, a benchmark against DocTR, YOLO field detection, Aadhaar masking, signature cropping, FastAPI endpoints, and a retrieval chatbot."
  - "Lesson: building an AI feature isn’t just choosing a model; most of the work is around it."
metrics: []
pipeline:
  - { step: Upload, kind: step }
  - { step: Preprocess, kind: step, note: denoise · binarize · normalise }
  - { step: Locate fields, kind: model, note: YOLO }
  - { step: Detect text, kind: model, note: DBNet }
  - { step: Recognise text, kind: model, note: PARSeq }
  - { step: Mask sensitive data, kind: check, note: e.g. Aadhaar }
  - { step: Structured JSON, kind: step, note: via FastAPI }
pipelineCaption: "Each stage is its own model or step, not one black box."
stack:
  - Python
  - FastAPI
  - PaddleOCR
  - YOLO
  - DBNet
  - PARSeq
  - DocTR
  - AES
linkNote: "This was company work, so there’s no code to link and no internal numbers to share."
---

## The problem

A user uploads a document or a photo of one. The system has to find the fields that matter, read them accurately, protect anything sensitive, such as an Aadhaar number, and hand back structured data another application can use.

My main contribution was on the image-processing and OCR side of that pipeline, and on connecting those pieces into the Python backend.

## What I worked on

### Start with the input

OCR accuracy depends heavily on the image. Real documents arrive at different resolutions, with noise, uneven lighting, skew and inconsistent layouts. I tuned the preprocessing (denoising, binarization and normalization) to improve the input quality before anything reached the OCR models.

### Treat OCR as stages

“Run OCR” is really two problems: finding *where* the text is, and reading *what* it says. I built the pipeline for printed documents on PaddleOCR, with DBNet detecting text regions and PARSeq recognising the characters, then added YOLO-based detection to locate specific fields first.

I didn’t take the stack on faith: I benchmarked the pipeline against DocTR on accuracy and performance.

### Mask sensitive data before anything else sees it

I added Aadhaar masking to the pipeline: once the sensitive region of a document image is identified, it’s masked before the document is processed further. I also added signature-region cropping, and handled how those crops were stored and retrieved.

### Make it callable

Instead of separate Python scripts, I built FastAPI endpoints that expose the ML and document-processing pipelines to other services: send a document, get structured JSON back.

### Protect the data with standard tools

I implemented AES-based encryption and decryption, single and batch, so sensitive information wasn’t stored or passed around in plaintext. It used a standard AES implementation, not anything I designed; with symmetric encryption, the real engineering question is how the key is managed.

### Don’t send every question to an LLM

I also built a hybrid retrieval chatbot. It started with TF-IDF and fuzzy matching and moved to embedding-based retrieval, with a similarity threshold deciding whether a question gets a rule-based answer or goes to an LLM API.

## What I took from it

> Building an AI feature isn’t just choosing a model. A real application needs preprocessing, validation, APIs, error handling, security, and integration between the parts.
