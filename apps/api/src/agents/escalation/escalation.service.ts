import { Injectable } from "@nestjs/common";

/**
 * Routes tickets to the right human queue and prepares the handoff package
 * (summary, triage data, AI draft answer) so humans get full context fast.
 */
@Injectable()
export class EscalationService {
  pickQueue(category: string, urgency: string): string {
    if (urgency === "critical") return "priority";
    if (category === "billing" || category === "refund") return "finance";
    if (category === "technical") return "engineering-support";
    return "general";
  }
}
