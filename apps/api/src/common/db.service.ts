import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool } from "pg";

@Injectable()
export class DbService implements OnModuleDestroy {
  readonly pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://support:support@localhost:5432/support_agent",
  });

  query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ) {
    return this.pool.query<T>(text, params as never);
  }

  async similaritySearch(
    embeddings: number[],
    topK: number,
  ): Promise<{ id: string; content: string }[]> {
    const vector = `[${embeddings.join(",")}]`;
    const result = await this.query<{ id: string; content: string }>(
      `
      SELECT id, content FROM knowledge_chunks
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `,
      [vector, topK],
    );
    return result.rows;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
