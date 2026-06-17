import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { EscalationService } from "./escalation.service";
import { DbService } from "src/common/db.service";
import { EventsGateway } from "src/gateway/events.gateway";

@Processor("escalation")
export class EscalationProcessor extends WorkerHost {
  constructor(private escalationService: EscalationService, private dbService: DbService, private eventsGateway: EventsGateway) {
    super();
  }

  async process(job: Job) {
    const { triage } = job.data;
    const queue = this.escalationService.pickQueue(triage?.category ?? "general", triage?.urgency ?? "medium");

    await this.dbService.query("UPDATE tickets SET status = 'escalated', updated_at = now() WHERE id = $1", [job.data.ticketId]);
    this.eventsGateway.ticketUpdated(job.data.ticketId, "escalated");

    return { assignedQueue: queue };
  }
}
