import { Inject, Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { randomUUID } from "crypto";

import { DbService } from "src/common/db.service";
import { EventsGateway } from "src/gateway/events.gateway";

@Injectable()
export class TicketsService {
  constructor(
    @InjectQueue("triage") private triageQueue: Queue,
    private dbService: DbService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(input: { customerEmail: string; subject: string; body: string }) {
    const ticketId = randomUUID();
    const { customerEmail, subject, body } = input;

    // TODO: Use a transaction here to ensure both operations succeed or fail together
    await this.dbService.query(
      "INSERT INTO tickets (id, customer_email, subject, body, status) VALUES ($1, $2, $3, $4, 'new')",
      [ticketId, customerEmail, subject, body],
    );
    this.eventsGateway.ticketUpdated(ticketId, "new");
    await this.triageQueue.add("triage", { ticketId, ...input });
    return { ticketId, status: "new" };
  }

  async list(status?: string) {
    const result = await this.dbService.query(
      `SELECT id, customer_email, subject, summary, urgency, category, status, updated_at FROM tickets
        WHERE ($1::text IS NULL OR status = $1)
        ORDER BY updated_at DESC`,
      [status ?? null],
    );
    return result.rows;
  }

}
