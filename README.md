# Intelligent Customer Support Escalation System

A learning project for AI-agentic workflows. An autonomous pipeline triages
customer tickets, attempts AI resolution via RAG, escalates to humans when
needed, and learns from every resolution.

## Stack

- **Frontend:** Next.js 15 (App Router) — `apps/web`
- **Backend:** NestJS 10 + BullMQ — `apps/api`
- **Shared contracts:** Zod schemas — `packages/shared`
- **Infra:** PostgreSQL + pgvector, Redis (local via Docker Compose; Azure in prod)
- **AI:** Azure OpenAI (chat + embeddings)
- **CI/CD:** GitHub Actions → Azure Container Apps

## The agentic pipeline

```
ticket ──> Triage Agent ──┬──> Resolution Agent ──┬──> answer customer ──> Learning Agent
                          │    (RAG + confidence) │
                          │                       └──(low confidence)──┐
                          └──(angry / critical)────────────────────────┴──> Escalation Agent ──> human ──> Learning Agent
```

Each agent is a BullMQ queue + processor. Agent outputs are Zod-validated
JSON (`packages/shared/src/schemas`), so routing stays deterministic.

## Getting started

```bash
pnpm install
cp .env.example .env        # fill in Azure OpenAI credentials
pnpm infra:up               # starts Postgres + Redis
pnpm dev                    # starts web (:3000) and api (:3001)
```

## Roadmap

- [x] Week 1–2: Monorepo scaffold, infra, ticket intake
- [x] Week 3: Triage Agent — persist results, wire websocket updates
- [ ] Week 4: Resolution Agent — pgvector schema, embedding pipeline, RAG
- [ ] Week 5: Escalation — human dashboard, queue assignment, draft review
- [ ] Week 6: Learning loop + Azure deploy via GitHub Actions
