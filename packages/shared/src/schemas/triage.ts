import { z } from "zod";

/**
 * The Triage Agent's structured output contract.
 * The LLM is prompted to return exactly this shape; we validate with Zod
 * so downstream routing logic stays deterministic.
 */
export const TriageResult = z.object({
  category: z.enum(["billing", "technical", "account", "refund", "general"]),
  sentiment: z.number().min(-1).max(1)
    .describe("-1 = furious, 0 = neutral, 1 = delighted"),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  summary: z.string().max(280)
    .describe("One-sentence summary for the human queue"),
  language: z.string().describe("ISO 639-1 code, e.g. 'en', 'hu'"),
});
export type TriageResult = z.infer<typeof TriageResult>;
