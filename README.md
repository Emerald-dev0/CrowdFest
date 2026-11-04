# CrowdFest — AI Crowd Simulation Platform

Open-source core · Hybrid execution (real browsers + HTTP virtual users)

> Describe how people use your application. Generate virtual users. Simulate their behaviour. Discover how much traffic your application can sustain.

CrowdFest is an AI-powered load and user-experience testing platform that lets developers simulate realistic populations of people interacting with their applications. It combines three things:

1. **AI-powered user journey generation** — describe your users in plain language, the AI proposes structured journeys, you review and approve.
2. **Real browser-based interaction testing** — Playwright-controlled browser sessions with isolated contexts.
3. **High-concurrency workload simulation** — lightweight HTTP virtual users powered by k6.

It is **not** simply a browser automation tool, and it is **not** just another HTTP benchmarking utility. Browser agents and HTTP virtual users run together, but their counts are never combined into a misleading total.

## Repo structure (npm workspaces monorepo)

```
crowdfest/
├── apps/
│   ├── web/          # Next.js dashboard (landing page, scenario wizard, live monitoring, reports)
│   └── api/          # Fastify control-plane API (REST endpoints, runs on :3001)
├── services/
│   ├── ai-service/         # LLM adapter, scenario planner, journey builder, validation & analysis agents
│   ├── orchestrator/       # Simulation state machine, BullMQ job coordination, WebSocket live feed
│   ├── browser-worker/     # Playwright real-browser execution with isolated contexts
│   ├── load-worker/        # k6 HTTP load generation
│   ├── metrics-worker/     # Time-windowed metric aggregation
│   └── report-worker/      # Performance report generation (executive summary, performance, journeys, failures)
├── packages/
│   ├── contracts/        # Shared TypeScript/Zod schemas (scenarios, simulations, metrics, API contracts)
│   ├── database/         # Drizzle ORM schema (15 tables: users, orgs, projects, environments, target_verifications, scenarios, scenario_versions, simulations, execution_groups, worker_assignments, simulation_events, metric_aggregates, simulation_reports, usage_records)
│   ├── scenario-dsl/     # Journey step definitions, scenario, persona, workload DSL
│   ├── scenario-compiler/# Workflow compiler: scenario DSL -> Playwright script + k6 script
│   ├── execution-sdk/    # Worker interfaces, job types, result types
│   ├── metrics/          # Metric definitions (P50/P90/P95/P99 latency, throughput, error rate, concurrency)
│   ├── security/         # Target verification (DNS TXT / HTTP challenge), SSRF prevention, execution limits
│   └── config/           # Shared env loading + conservative default execution limits
├── infrastructure/
│   └── docker/           # Dockerfiles (api, web, worker) + docker-compose (PostgreSQL + Redis + all services)
├── docs/
│   ├── architecture.md   # High-level architecture & tech stack
│   ├── execution-engine.md # Two execution modes, browser/HTTP execution, simulation lifecycle
│   ├── scenario-dsl.md   # Journey steps, scenario definition, workflow compiler, agent personas
│   ├── security.md       # Target verification, network isolation, SSRF prevention, execution limits, test data safety, secret management
│   ├── roadmap.md        # MVP implementation roadmap (Phases 1-5)
│   └── contributing.md   # Development setup & contributing guide
├── AGENTS.md
├── README.md
└── package.json
```

## Tech stack

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| Frontend | Next.js 14 + React | Dashboard UI |
| Styling | Tailwind CSS | Interface |
| Backend | Node.js + TypeScript | Control plane |
| API | Fastify | HTTP API |
| Database | PostgreSQL | Persistent data |
| ORM | Drizzle ORM | Database access |
| Queue | Redis + BullMQ | Job coordination |
| AI | Provider-agnostic LLM adapter (OpenAI / Anthropic / mock) | Scenario generation |
| Browser | Playwright | Real browser execution |
| Load engine | Grafana k6 | HTTP load generation |
| Realtime | WebSockets | Live dashboard feed |
| Metrics | Prometheus-compatible | Performance monitoring |
| Tracing | OpenTelemetry | Execution observability |
| Object storage | S3-compatible | Reports & artifacts |
| Deployment | Docker | Reproducible workers |

## API reference (Fastify, `/api/v1`)

Base URL: `http://localhost:3001` (dev)

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/health` | Health check | ✅ Implemented |
| POST | `/projects` | Create a project | ✅ Implemented |
| GET | `/projects` | List projects | ✅ Implemented |
| POST | `/projects/:id/environments` | Add an environment to a project | ✅ Implemented |
| POST | `/environments/:id/verify` | Verify target authorization (pending/verified/failed) | ✅ Implemented |
| POST | `/projects/:id/scenarios` | Create a scenario | ✅ Implemented |
| POST | `/scenarios/:id/generate` | Generate a journey with AI | ⚠️ 501 (Phase 3) |
| POST | `/scenarios/:id/validate` | Validate a proposed journey | ⚠️ 501 (Phase 3) |
| POST | `/scenarios/:id/approve` | Approve a scenario version | ⚠️ 501 (Phase 3) |
| POST | `/projects/:id/simulations` | Create a simulation (status: draft) | ✅ Implemented |
| POST | `/simulations/:id/start` | Start an approved simulation | ⚠️ 501 (Phase 2) |
| POST | `/simulations/:id/cancel` | Cancel a running simulation | ⚠️ 501 (Phase 2) |
| GET | `/simulations/:id` | Get a simulation | ✅ Implemented |
| GET | `/simulations/:id/events` | Retrieve simulation events | ✅ Implemented |
| GET | `/simulations/:id/metrics` | Retrieve metric aggregates | ✅ Implemented |
| GET | `/simulations/:id/report` | Retrieve the simulation report | ✅ Implemented |

## Database schema (15 tables)

| Table | Description |
|-------|-------------|
| `users` | Platform users (id, email, name) |
| `organizations` | Billing/access orgs (id, name, plan) |
| `organization_members` | User ↔ org membership with role |
| `projects` | Apps under test (id, org, name) |
| `environments` | Target URLs per project (dev/staging/prod) |
| `target_verifications` | DNS TXT / HTTP challenge verification |
| `scenarios` | Named user journeys (id, project, name) |
| `scenario_versions` | Versioned scenario definitions (DSL JSON, approved flag) |
| `simulations` | Test runs (status state machine, workload config, thresholds) |
| `execution_groups` | Browser / HTTP worker groups per simulation |
| `worker_assignments` | Worker ↔ execution group mapping |
| `simulation_events` | Timestamped activity feed entries |
| `metric_aggregates` | Time-windowed metric snapshots |
| `simulation_reports` | Generated performance reports (JSON + S3 key) |
| `usage_records` | Per-org resource usage tracking |

Simulation state machine: `draft → validating → awaiting_approval → queued → preparing_workers → running → stopping/finalizing → completed / failed / cancelled`.

## The four concurrency measurements (never combined)

Per the product spec, these are tracked and displayed separately — **1,000 HTTP virtual users ≠ 1,000 real browsers**:

- **Concurrent browser sessions** — active Playwright browser contexts
- **Concurrent virtual users** — active k6 HTTP workload sessions
- **Concurrent requests** — requests currently in flight
- **Arrival rate** — new user journeys starting per unit of time

## Getting started

### Prerequisites
- Node.js ≥ 20
- Docker & Docker Compose

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev datastore

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

This starts PostgreSQL (:5432) and Redis (:6379).

### 3. Push the database schema

```bash
npx drizzle-kit push --config=packages/database/drizzle.config.ts
```

### 4. Run the API

```bash
cd apps/api
DATABASE_URL=postgresql://crowdfest:crowdfest@localhost:5432/crowdfest \
  REDIS_URL=redis://localhost:6379 \
  npm run dev
```

The API listens on `http://0.0.0.0:3001`.

### 5. Run the web dashboard

```bash
cd apps/web
npm run dev
```

The dashboard runs on `http://localhost:3000`.

### 6. Run all services (Docker)

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

This starts PostgreSQL, Redis, the API, the web dashboard, and all six workers (orchestrator, browser-worker, load-worker, metrics-worker, report-worker, ai-service).

## Phase status

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 — Core foundation | Monorepo, Drizzle schema, Fastify API, projects/environments/target verification, simulation state machine, Docker dev env | ✅ Done |
| Phase 2 — Execution engine | Playwright worker, k6 worker, Scenario DSL, workflow compiler, worker coordination, event collection | ✅ Done (scaffolding) |
| Phase 3 — AI scenario generation | LLM adapter, planner, journey builder, validation agent, analysis agent | ✅ Done (scaffolding, mock LLM provider) |
| Phase 4 — Dashboard & reporting | Simulation wizard, live monitoring, reports page | ✅ Done (scaffolding) |
| Phase 5 — Reliability & release | Security review, reproducibility, docs, public beta | 🚧 In progress |

## Security

- **Target verification**: environments must be verified via DNS TXT or HTTP challenge before tests can run against them.
- **SSRF prevention**: loopback addresses, private networks (RFC 1918), link-local addresses, and cloud metadata endpoints (`169.254.169.254`, `metadata.google.internal`) are blocked.
- **Execution limits**: conservative defaults — max 900s duration, 20 browser sessions, 500 virtual users, 1,000 req/s. Benchmark before increasing.
- **Test data safety**: synthetic accounts only. No real payments, emails, SMS, or production customer data.

## Contributing

CrowdFest is MIT-licensed and open source. See `docs/contributing.md` for the development setup and `docs/roadmap.md` for the phased release plan.

### Quick contribution steps

1. Fork the repo and create a feature branch from `main`.
2. Make your changes (packages, services, or apps).
3. Ensure TypeScript passes: `npx tsc --noEmit` against each package/app `tsconfig.json`.
4. Open a pull request against `main`.

## License

MIT

## CLI

A small developer CLI is included under `apps/cli`:

```bash
cd apps/cli && npm run build
node dist/index.js health
node dist/index.js launch "Staging test" https://staging.example.com "users register and view dashboard"
node dist/index.js list
```


## Running the frontend

```bash
# from repo root
npm install
cd apps/web
npm run dev
```

The dashboard runs on http://localhost:3000. Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` to point at your API and orchestrator (defaults: http://localhost:3001 and ws://localhost:4000).
