---
order: 4
project: "CarbonGrid · IndiaNext Hackathon"
title: "A campus carbon score and reduction plan, built in 24 hours"
summary: "At the IndiaNext national hackathon, a team of four built a platform that turns a campus’s energy, water, waste and green-cover data into emissions, a sustainability score and AI-generated recommendations. We placed 2nd out of 234 teams."
kind: Hackathon
period: "16 – 17 Mar 2026 · KES’ College, Mumbai"
ownership: "Team CarbonHackers (four people) — I worked on the AI side of the product"
status: Hackathon
proof:
  - 2nd of 234 teams
  - 24 hours
  - live demo
tldr:
  - "Problem: organisations want to know their carbon footprint and what to do about it, without a climate team."
  - "What we built: India-specific emission calculations, a 0–100 sustainability score, a map view with a green-cover estimate, AI recommendations and reports."
  - "Result: 2nd place out of 234 teams, and a ₹20,000 prize."
metrics:
  - value: 2nd / 234
    label: teams at IndiaNext
  - value: 24 h
    label: from start to judged demo
  - value: "₹20,000"
    label: prize
pipeline:
  - { step: Campus data, kind: step, note: form or PDF }
  - { step: Emission engine, kind: step, note: India-specific factors }
  - { step: Score + projections, kind: step }
  - { step: Recommendations, kind: model }
  - { step: Report, kind: step, note: PDF }
stack:
  - Next.js
  - TypeScript
  - Leaflet
  - LLM APIs
links:
  - label: Live demo
    href: https://carbongrids.netlify.app
linkNote: "The code lives in a teammate’s private repository."
---

## What we built

An organisation enters or uploads its campus data (energy, water, waste, green cover, buildings) and CarbonGrid returns:

- emissions calculated with India-specific emission factors,
- a sustainability score out of 100, broken down by category,
- a map-based view of the campus with a rough estimate of green cover from satellite map imagery,
- AI-generated recommendations, and
- projections, green-credit estimates and downloadable reports.

## My part

I worked on the AI side of the product with the team. My changes reached the shared repository through a teammate, so its commit history doesn’t list them separately.

## The result

**2nd place out of 234 teams** at the IndiaNext national hackathon, with a ₹20,000 prize.
