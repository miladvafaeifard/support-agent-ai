import { Injectable } from "@nestjs/common";
import { LlmService } from "../../common/llm.service";

/**
 * The feedback loop: after any resolution (AI or human), distill the ticket
 * into a clean Q->A pair, embed it, and store it in pgvector so the
 * Resolution Agent gets smarter over time.
 */
@Injectable()
export class LearningService {
  constructor(private llm: LlmService) {}

  async capture(question: string, answer: string): Promise<void> {
    const vector = await this.llm.embed(`Q: ${question}\nA: ${answer}`);
    // TODO (week 6): insert into knowledge_chunks (content, embedding, source)
    void vector;
  }
}
