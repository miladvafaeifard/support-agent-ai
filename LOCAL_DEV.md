# Local Development

The goal: run the entire agentic pipeline on your machine with **zero cloud
dependencies**, verify it works, then flip to real Azure only when ready.

## How local dev is structured

- **Backing services** (Postgres + pgvector, Redis, Adminer) run in Docker.
- **Apps** (Next.js + NestJS) run on the host via `pnpm dev` for fast hot-reload.
- **LLM calls are mocked** by default (`LLM_MODE=mock`), so no Azure keys needed.

## Prerequisites

- Node 22+ and pnpm 9 (`corepack enable pnpm`)
- Docker Desktop (or Docker Engine + Compose v2)

## First run

```bash
pnpm install            # generates pnpm-lock.yaml (commit it)
cp .env.example .env    # already defaults to LLM_MODE=mock
pnpm infra:up           # Postgres + Redis + Adminer, with healthchecks
pnpm dev                # web :3000, api :3001
```

`infra:up` auto-runs `infra/postgres/init.sql` on first boot, creating the
`vector` extension and the `tickets`, `ticket_events`, and `knowledge_chunks`
tables.

## Verify everything works

```bash
pnpm smoke
```

This checks `/health` (expects `postgres: up`, `redis: up`) and pushes two
tickets through the pipeline. Then watch them move:

- **Queue dashboard:** http://localhost:3001/admin/queues — jobs appear in
  `triage`, then fan out to `resolution` / `escalation` / `learning`.
- **Database browser:** http://localhost:8080 (Adminer) — server `postgres`,
  user/pass `support`, db `support_agent`.

Expected behavior in mock mode:
- The simple ticket → triage → resolution (low confidence, empty KB) → escalation.
- The angry refund ticket → triage flags it critical → straight to escalation.

## Common tasks

```bash
pnpm infra:logs     # tail service logs
pnpm infra:reset    # wipe the DB volume and re-run init.sql (fresh start)
pnpm infra:down     # stop services
```

## Going to real Azure (when ready)

1. Create an Azure OpenAI resource with `gpt-4o` and `text-embedding-3-small` deployments.
2. Fill the `AZURE_OPENAI_*` values in `.env` and set `LLM_MODE=live`.
3. Re-run `pnpm smoke` — the same flow now uses real model calls.

## Prod-like check before deploying

Run the apps as containers (mirrors what Azure Container Apps will run):

```bash
docker compose -f docker-compose.yml -f docker-compose.full.yml up --build
```

If that comes up clean and `pnpm smoke` passes against it, you're ready to wire
up the GitHub Actions deploy job.

## Troubleshooting

- **`postgres: down` in /health** — give it a few seconds on first boot, or check
  `pnpm infra:logs`. If the schema looks wrong, `pnpm infra:reset`.
- **Port already in use** — something else is on 5432/6379/3000/3001; stop it or
  change the port mapping in `docker-compose.yml`.
- **Queue jobs stuck** — confirm Redis is healthy (`docker compose ps`) and the
  API process is running (the processors live inside it).
