import { Global, Module } from "@nestjs/common";
import { DbService } from "./db.service";
import { LlmService } from "./llm.service";

// Global so every feature module can inject Db + Llm without re-importing.
@Global()
@Module({
  providers: [DbService, LlmService],
  exports: [DbService, LlmService],
})
export class CommonModule {}
