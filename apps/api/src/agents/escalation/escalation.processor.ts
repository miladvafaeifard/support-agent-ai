import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { EscalationService } from "./escalation.service";

@Processor("escalation")
export class EscalationProcessor extends WorkerHost {
  constructor(private escalationService: EscalationService) {
    super();
  }

  async process(job: Job) {
    const { triage } = job.data;
    const queue = this.escalationService.pickQueue(triage?.category ?? "general", triage?.urgency ?? "medium");

    // TODO: persist assignment, notify dashboard via websocket gateway
    return { assignedQueue: queue };
  }
}
