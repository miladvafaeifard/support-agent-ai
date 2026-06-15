import { Module } from "@nestjs/common";
import { AgentsModule } from "../agents/agents.module";
import { TicketsController } from "./tickets.controller";
import { TicketsService } from "./tickets.service";
import { EventsGateway } from "src/gateway/events.gateway";

@Module({
  imports: [AgentsModule],
  controllers: [TicketsController],
  providers: [TicketsService, EventsGateway],
})
export class TicketsModule {}
