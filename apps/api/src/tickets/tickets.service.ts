import { Inject, Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { randomUUID } from "crypto";
import { DbService } from "src/common/db.service";

@Injectable()
export class TicketsService {
  constructor(
    @InjectQueue("triage") private triageQueue: Queue,
    @Inject("DbService")  private dbService: DbService,
  ) {}

  async create(input: { customerEmail: string; subject: string; body: string }) {
    const ticketId = randomUUID();
    const { customerEmail, subject, body } = input;

    // TODO: Use a transaction here to ensure both operations succeed or fail together
    await this.dbService.query(
      "INSERT INTO tickets (id, customer_email, subject, body, status) VALUES ($1, $2, $3, $4, 'new')",
      [ticketId, customerEmail, subject, body],
    );
    await this.triageQueue.add("triage", { ticketId, ...input });
    
    return { ticketId, status: "new" };
  }
}
