---
order: 3
project: "Document intelligence · Miscot Systems"
title: "OCR is a pipeline, not a model"
summary: "During my internship I worked on turning uploaded documents into structured data: preprocessing, staged detection and recognition, masking sensitive fields, and exposing it all through FastAPI."
kind: Internship
period: "Dec 2025 – Feb 2026 · Mumbai"
ownership: "Software Developer Intern, Python team — image processing and OCR pipeline, backend integration"
status: Internship
proof:
  - YOLO → DBNet → PARSeq
  - Aadhaar masking
  - FastAPI
tldr:
  - "Problem: take an uploaded document, find the fields that matter, read them reliably, and never expose sensitive data on the way."
  - "My part: image preprocessing and the OCR pipeline, Aadhaar masking, signature extraction, and wiring it into FastAPI."
  - "Lesson: building an AI feature isn’t just choosing a model; most of the work is around it."
metrics: []
pipeline:
  - { step: Upload, kind: step }
  - { step: Preprocess, kind: step }
  - { step: Locate fields, kind: model, note: YOLO }
  - { step: Detect text, kind: model, note: DBNet }
  - { step: Recognise text, kind: model, note: PARSeq }
  - { step: Mask sensitive data, kind: check, note: e.g. Aadhaar }
  - { step: Structured JSON, kind: step, note: via FastAPI }
pipelineCaption: "Each stage is its own model or step, not one black box."
stack:
  - Python
  - FastAPI
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

OCR accuracy depends heavily on the image. Real documents arrive at different resolutions, with noise, uneven lighting, skew and inconsistent layouts. I worked on preprocessing the images and checked how each step changed the extracted text.

### Treat OCR as stages

“Run OCR” is really two problems: finding *where* the text is, and reading *what* it says. We used separate models for each, DBNet to detect text regions and PARSeq to recognise the characters, and YOLO to locate specific fields first where they mattered. I also explored DocTR as an alternative and compared the approaches.

### Mask sensitive data before anything else sees it

I worked on Aadhaar masking: once the sensitive region of a document image is identified, it’s masked before the document is processed further. I also worked on extracting specific regions, such as cropping the signature from a particular page, and on how those crops were stored and retrieved.

### Make it callable

Instead of separate Python scripts, I integrated these workflows into FastAPI endpoints, so another part of the application could send a document and get structured JSON back.

### Protect the data with standard tools

I implemented AES-based encryption and decryption, single and batch, so sensitive information wasn’t stored or passed around in plaintext. It used a standard AES implementation, not anything I designed; with symmetric encryption, the real engineering question is how the key is managed.

### Don’t send every question to an LLM

I also worked on a chatbot that looked for relevant information in a knowledge base first, using retrieval, and used an LLM API to generate a response where that made sense.

## What I took from it

> Building an AI feature isn’t just choosing a model. A real application needs preprocessing, validation, APIs, error handling, security, and integration between the parts.
