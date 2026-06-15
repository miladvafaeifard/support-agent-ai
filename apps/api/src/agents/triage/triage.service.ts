import { Injectable } from "@nestjs/common";
import { TriageResult } from "@support-agent/shared";
import { LlmService } from "../../common/llm.service";

@Injectable()
export class TriageService {
  constructor(private llm: LlmService) {}

  async triage(subject: string, body: string): Promise<TriageResult> {
    return this.llm.completeStructured({
      schema: TriageResult,
      system: `You are a support-ticket triage system. Analyze the ticket and
respond ONLY with a JSON object matching this shape:
{ "category": "billing|technical|account|refund|general",
  "sentiment": <number -1..1>,
  "urgency": "low|medium|high|critical",
  "summary": "<one sentence>",
  "language": "<ISO 639-1>" }`,
      user: `Subject: ${subject}\n\nBody:\n${body}`,
      // Cheap heuristic mock so local routing behaves believably without Azure.
      mock: this.heuristicMock(subject, body),
    });
  }

  private heuristicMock(subject: string, body: string): TriageResult {
    const text = `${subject} ${body}`.toLowerCase();
    const angry = /(angry|furious|terrible|worst|refund now|unacceptable|asap|immediately)/.test(text);
    const category = /refund|charge|charged|invoice|billing/.test(text)
      ? "billing"
      : /error|bug|crash|broken|not working/.test(text)
        ? "technical"
        : /login|password|account|locked/.test(text)
          ? "account"
          : "general";
    return {
      category: category as TriageResult["category"],
      sentiment: angry ? -0.8 : 0.1,
      urgency: angry ? "critical" : "medium",
      summary: `${category} issue: ${subject}`.slice(0, 280),
      language: "en",
    };
  }
}
