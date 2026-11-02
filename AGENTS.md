# CrowdFest

AI-powered crowd simulation and application capacity testing.

This is a TypeScript monorepo (npm workspaces). Packages live under `apps/`, `packages/`, and `services/`.

## Repo layout

- `apps/web` — Next.js dashboard (landing page + simulations wizard, live monitoring, reports)
- `apps/api` — Fastify control-plane API (spec §9 endpoints)
- `packages/database` — Drizzle ORM schema (spec §8.2, 15 tables)
- `packages/contracts` — shared TypeScript/Zod schemas (spec §5, §9)
- `packages/scenario-dsl` — journey step definitions (spec §5.2, §5.4)
- `packages/scenario-compiler` — workflow compiler → Playwright/k6 (spec §5.3, §6)
- `packages/execution-sdk` — worker interfaces
- `packages/metrics` — metric definitions (spec §7.1, §11)
- `packages/config` — shared env + execution limits (spec §10.3)
- `packages/security` — target verification, SSRF prevention, limits (spec §10)
- `services/orchestrator` — simulation state machine + job coordination (spec §6.4)
- `services/browser-worker` — Playwright real-browser execution (spec §6.1)
- `services/load-worker` — k6 HTTP load generation (spec §6.2)
- `services/metrics-worker` — metrics aggregation (spec §7.4)
- `services/report-worker` — report generation (spec §11)
- `services/ai-service` — LLM adapter, planner, builder, validator, analyzer (spec §5)
- `infrastructure/docker/` — Dockerfiles + docker-compose (spec §13 Phase 1)
- `docs/` — architecture, execution-engine, scenario-dsl, security, roadmap, contributing

## Tech stack (spec §4.2)

Next.js + React · Tailwind CSS · Fastify · Node.js + TypeScript · PostgreSQL · Drizzle ORM · Redis + BullMQ · Playwright · Grafana k6 · WebSockets · OpenTelemetry · S3-compatible · Docker

## Getting started

```bash
npm install
docker compose -f infrastructure/docker/docker-compose.yml up -d
# Push Drizzle schema per package, then:
cd apps/api && DATABASE_URL=... REDIS_URL=... npm run dev
cd apps/web && npm run dev
```

## Type checking

Run `tsc --noEmit` against each package/app tsconfig. All must pass before committing.
