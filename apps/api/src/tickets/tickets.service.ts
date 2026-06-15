import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { randomUUID } from "crypto";

@Injectable()
export class TicketsService {
  constructor(@InjectQueue("triage") private triageQueue: Queue) {}

  async create(input: { customerEmail: string; subject: string; body: string }) {
    const ticketId = randomUUID();
    // TODO: persist ticket row in PostgreSQL (status: "new")
    await this.triageQueue.add("triage", { ticketId, ...input });
    return { ticketId, status: "new" };
  }
}
