import { Injectable } from "@nestjs/common";
import { ResolutionResult } from "@support-agent/shared";
import { LlmService } from "../../common/llm.service";
import { DbService } from "src/common/db.service";

@Injectable()
export class ResolutionService {
  constructor(private llm: LlmService, private db: DbService) {}

  /**
   * RAG flow:
   * 1. embed the question
   * 2. retrieve top-k similar KB chunks / past resolutions from pgvector
   * 3. generate an answer grounded in those chunks, with self-assessed confidence
   */
  async resolve(question: string): Promise<ResolutionResult> {
    const vector = await this.llm.embed(question);
    const chunks = await this.db.similaritySearch(vector, 5);

    return this.llm.completeStructured({
      schema: ResolutionResult,
      system: `You are a customer support resolution agent. Answer ONLY using the
provided knowledge-base context. If the context is insufficient, say so and
set confidence low. Respond ONLY with JSON:
{ "answer": "...", "confidence": <0..1>, "sourcesUsed": [...ids], "reasoning": "..." }`,
      user: `Context:\n${chunks.map(c => `[${c.id}] ${c.content}`).join("\n") || "(no context available)"}\n\nQuestion:\n${question}`,
      // With an empty KB locally, confidence is low on purpose so you can see
      // the escalation path fire. Seed the KB (week 4) to watch this flip.
      mock: {
        answer: "Thanks for reaching out — a teammate will follow up shortly.",
        confidence: chunks.length === 0 ? 0.3 : 0.85,
        sourcesUsed: chunks.map(c => c.id),
        reasoning: "Local mock: no knowledge base seeded yet, so confidence is intentionally low.",
      },
    });
  }
}
