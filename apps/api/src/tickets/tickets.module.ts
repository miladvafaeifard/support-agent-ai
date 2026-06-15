import { Module } from "@nestjs/common";
import { AgentsModule } from "../agents/agents.module";
import { TicketsController } from "./tickets.controller";
import { TicketsService } from "./tickets.service";

@Module({
  imports: [AgentsModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
