import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { TriageProcessor } from "./triage/triage.processor";
import { TriageService } from "./triage/triage.service";
import { ResolutionProcessor } from "./resolution/resolution.processor";
import { ResolutionService } from "./resolution/resolution.service";
import { EscalationProcessor } from "./escalation/escalation.processor";
import { EscalationService } from "./escalation/escalation.service";
import { LearningProcessor } from "./learning/learning.processor";
import { LearningService } from "./learning/learning.service";

/**
 * The agentic pipeline. Each agent is a BullMQ queue + processor pair:
 *
 *   ticket created ──> "triage" queue
 *   triage done    ──> "resolution" queue   (or "escalation" if angry/critical)
 *   low confidence ──> "escalation" queue
 *   resolved/closed──> "learning" queue
 *
 * Queues make every agent step observable, retryable, and decoupled.
 * (LlmService + DbService come from the global CommonModule.)
 */
export const QUEUES = {
  TRIAGE: "triage",
  RESOLUTION: "resolution",
  ESCALATION: "escalation",
  LEARNING: "learning",
} as const;

const queueNames = Object.values(QUEUES);

@Module({
  imports: [
    BullModule.registerQueue(...queueNames.map((name) => ({ name }))),
    // Register every queue with the Bull Board dashboard.
    BullBoardModule.forFeature(
      ...queueNames.map((name) => ({ name, adapter: BullMQAdapter })),
    ),
  ],
  providers: [
    TriageService, TriageProcessor,
    ResolutionService, ResolutionProcessor,
    EscalationService, EscalationProcessor,
    LearningService, LearningProcessor,
  ],
  exports: [BullModule],
})
export class AgentsModule {}
