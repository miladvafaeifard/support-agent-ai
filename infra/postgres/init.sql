-- Runs automatically the first time the Postgres container initializes
-- (mounted into /docker-entrypoint-initdb.d/). Safe to re-run: uses IF NOT EXISTS.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS tickets (
  id             UUID PRIMARY KEY,
  customer_email TEXT NOT NULL,
  subject        TEXT NOT NULL,
  body           TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'new',
  -- triage results (filled by the Triage Agent)
  category       TEXT,
  sentiment      REAL,
  urgency        TEXT,
  summary        TEXT,
  language       TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit trail: one row per agent action, so you can replay how a ticket
-- moved through the pipeline (great for debugging the workflow locally).
CREATE TABLE IF NOT EXISTS ticket_events (
  id         BIGSERIAL PRIMARY KEY,
  ticket_id  UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  agent      TEXT NOT NULL,          -- triage | resolution | escalation | learning
  payload    JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The knowledge base the Resolution Agent searches over via RAG.
-- 1536 dims = Azure OpenAI text-embedding-3-small.
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content    TEXT NOT NULL,
  embedding  VECTOR(1536),
  source     TEXT,                   -- 'kb-article' | 'past-resolution'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Approximate-nearest-neighbour index for fast similarity search.
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx
  ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
