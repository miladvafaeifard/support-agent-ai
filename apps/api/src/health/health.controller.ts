import { Controller, Get } from "@nestjs/common";
import { DbService } from "../common/db.service";
import IORedis from "ioredis";

@Controller("health")
export class HealthController {
  constructor(private db: DbService) {}

  @Get()
  async check() {
    const result = { status: "ok", postgres: "down", redis: "down" };

    try {
      await this.db.query("SELECT 1");
      result.postgres = "up";
    } catch {
      result.status = "degraded";
    }

    const redis = new IORedis({
      host: process.env.REDIS_HOST ?? "localhost",
      port: Number(process.env.REDIS_PORT ?? 6379),
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
    try {
      await redis.connect();
      await redis.ping();
      result.redis = "up";
    } catch {
      result.status = "degraded";
    } finally {
      redis.disconnect();
    }

    return result;
  }
}
