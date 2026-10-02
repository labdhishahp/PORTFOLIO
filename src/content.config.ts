import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const link = z.object({ label: z.string(), href: z.string().url() });

const work = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/work" }),
  schema: z.object({
    order: z.number(),
    project: z.string(), // the project's plain name
    title: z.string(), // the idea-framed title
    summary: z.string(), // 1–2 sentences for the index
    kind: z.string(), // Personal project / Internship / Hackathon
    period: z.string(),
    ownership: z.string(), // shown as "My part"
    status: z.enum(["Live", "In development", "Internship", "Hackathon"]),
    proof: z.array(z.string()), // short mono facts for index rows
    tldr: z.array(z.string()),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    pipeline: z
      .array(z.object({ step: z.string(), kind: z.enum(["model", "check", "step"]), note: z.string().optional() }))
      .optional(),
    pipelineCaption: z.string().optional(),
    decisions: z
      .array(z.object({ decision: z.string(), alternatives: z.string(), chose: z.string(), evidence: z.string() }))
      .default([]),
    stack: z.array(z.string()),
    links: z.array(link).default([]),
    linkNote: z.string().optional(),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/writing" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    kind: z.enum(["Note", "Deep dive"]).default("Note"),
  }),
});

export const collections = { work, writing };
