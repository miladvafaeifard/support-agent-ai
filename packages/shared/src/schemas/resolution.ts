import { z } from "zod";

/**
 * The Resolution Agent's structured output contract.
 * `confidence` drives the escalate-or-respond decision.
 */
export const ResolutionResult = z.object({
  answer: z.string(),
  confidence: z.number().min(0).max(1)
    .describe("Self-assessed confidence; below threshold => escalate"),
  sourcesUsed: z.array(z.string().uuid())
    .describe("IDs of knowledge-base chunks retrieved via RAG"),
  reasoning: z.string()
    .describe("Why this answer; shown to humans on escalation review"),
});
export type ResolutionResult = z.infer<typeof ResolutionResult>;
