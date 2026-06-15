import { Processor, WorkerHost, InjectQueue } from "@nestjs/bullmq";
import { Job, Queue } from "bullmq";
import { ResolutionService } from "./resolution.service";

const THRESHOLD = Number(process.env.RESOLUTION_CONFIDENCE_THRESHOLD ?? 0.75);

@Processor("resolution")
export class ResolutionProcessor extends WorkerHost {
  constructor(
    private resolutionService: ResolutionService,
    @InjectQueue("escalation") private escalationQueue: Queue,
    @InjectQueue("learning") private learningQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<{ ticketId: string; body: string; triage: unknown }>) {
    const result = await this.resolutionService.resolve(job.data.body);

    if (result.confidence >= THRESHOLD) {
      // TODO: send answer to customer (websocket/email), mark ticket resolved
      await this.learningQueue.add("capture", { ticketId: job.data.ticketId, resolution: result, resolvedBy: "ai" });
    } else {
      await this.escalationQueue.add("escalate", {
        ticketId: job.data.ticketId,
        triage: job.data.triage,
        draftAnswer: result, // humans see the AI's attempt + reasoning
        reason: "low-confidence",
      });
    }
    return result;
  }
}
