import { Injectable, Logger } from "@nestjs/common";
import { AzureOpenAI } from "openai";
import { z } from "zod";

const EMBEDDING_DIM = 1536; // text-embedding-3-small

/**
 * Thin wrapper around Azure OpenAI.
 *
 * Set LLM_MODE=mock (the default for local dev) to run the entire agentic
 * pipeline with NO Azure credentials. In mock mode `completeStructured`
 * returns the caller-supplied `mock` object and `embed` returns a
 * deterministic pseudo-vector. Set LLM_MODE=live to hit Azure for real.
 */
@Injectable()
export class LlmService {
  private readonly log = new Logger(LlmService.name);
  private readonly mode = process.env.LLM_MODE ?? "mock";
  private client?: AzureOpenAI;

  private getClient(): AzureOpenAI {
    if (!this.client) {
      this.client = new AzureOpenAI({
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        apiVersion: "2024-10-21",
      });
    }
    return this.client;
  }

  async completeStructured<T>(opts: {
    system: string;
    user: string;
    schema: z.ZodType<T>;
    mock: T; // realistic canned result, returned when LLM_MODE=mock
  }): Promise<T> {
    if (this.mode === "mock") {
      this.log.debug("LLM mock: returning canned structured result");
      return opts.schema.parse(opts.mock); // still validated, so mocks can't drift from the contract
    }

    const res = await this.getClient().chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    });
    const raw = res.choices[0]?.message?.content ?? "{}";
    return opts.schema.parse(JSON.parse(raw));
  }

  async embed(text: string): Promise<number[]> {
    if (this.mode === "mock") {
      return this.mockVector(text);
    }
    const res = await this.getClient().embeddings.create({
      model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT ?? "text-embedding-3-small",
      input: text,
    });
    return res.data[0].embedding;
  }

  /** Deterministic vector so the same text always embeds the same way locally. */
  private mockVector(text: string): number[] {
    let seed = 0;
    for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) % 2147483647;
    const out = new Array(EMBEDDING_DIM);
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      seed = (seed * 1103515245 + 12345) % 2147483647;
      out[i] = (seed / 2147483647) * 2 - 1;
    }
    return out;
  }
}
