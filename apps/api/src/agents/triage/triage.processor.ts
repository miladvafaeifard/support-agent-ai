import { Processor, WorkerHost, InjectQueue } from "@nestjs/bullmq";
import { Job, Queue } from "bullmq";
import { TriageService } from "./triage.service";
import { EventsGateway } from "src/gateway/events.gateway";

@Processor("triage")
export class TriageProcessor extends WorkerHost {
  constructor(
    private triageService: TriageService,
    private eventsGateway: EventsGateway,
    @InjectQueue("resolution") private resolutionQueue: Queue,
    @InjectQueue("escalation") private escalationQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<{ ticketId: string; subject: string; body: string }>) {
    const result = await this.triageService.triage(job.data.subject, job.data.body);
    this.eventsGateway.ticketUpdated(job.data.ticketId, "triaged");
    // TODO: persist TriageResult on the ticket row

    // Routing decision: angry or critical tickets skip the AI and go
    // straight to a human. Everything else gets a resolution attempt.
    const goStraightToHuman = result.sentiment < -0.6 || result.urgency === "critical";

    if (goStraightToHuman) {
      await this.escalationQueue.add("escalate", { ticketId: job.data.ticketId, triage: result, reason: "triage-direct" });
    } else {
      await this.resolutionQueue.add("resolve", { ticketId: job.data.ticketId, triage: result, body: job.data.body });
    }
    return result;
  }
}
