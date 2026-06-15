import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { BullBoardModule } from "@bull-board/nestjs";
import { ExpressAdapter } from "@bull-board/express";
import { CommonModule } from "./common/common.module";
import { HealthModule } from "./health/health.module";
import { TicketsModule } from "./tickets/tickets.module";
import { AgentsModule } from "./agents/agents.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? "localhost",
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    // Queue dashboard at http://localhost:3001/admin/queues
    BullBoardModule.forRoot({ route: "/admin/queues", adapter: ExpressAdapter }),
    CommonModule,
    HealthModule,
    TicketsModule,
    AgentsModule,
  ],
})
export class AppModule {}
