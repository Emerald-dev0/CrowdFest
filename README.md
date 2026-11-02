# CrowdFest — AI Crowd Simulation Platform

Open-source core · Hybrid execution (real browsers + HTTP virtual users)

> Describe how people use your application. Generate virtual users. Simulate their behaviour. Discover how much traffic your application can sustain.

## Repo structure (per product spec §12)

```
crowdfest/
├── apps/
│   ├── web/          # Next.js dashboard (scenario builder, live monitoring, reports)
│   ├── api/          # Fastify control-plane API
│   └── cli/          # Developer CLI (`npx crowdtest init` / `npx crowdtest run`)
├── services/
│   ├── ai-service/         # Scenario generation & analysis (LLM adapter)
│   ├── orchestrator/       # Simulation coordination & state machine
│   ├── browser-worker/     # Playwright real-browser execution
│   ├── load-worker/        # k6 HTTP load generation
│   ├── metrics-worker/     # Result processing & aggregation
│   └── report-worker/      # Report generation
├── packages/
│   ├── contracts/        # Shared TypeScript schemas (scenario, simulation, events)
│   ├── database/         # Drizzle ORM schema + migrations
│   ├── scenario-dsl/     # Journey step definitions
│   ├── scenario-compiler/# Workflow compiler (NL -> Playwright/k6)
│   ├── execution-sdk/    # Worker interfaces
│   ├── metrics/          # Metric definitions (P50/P95/P99, throughput, errors)
│   ├── security/         # Target verification, SSRF rules, execution limits
│   └── config/           # Shared configuration
├── infrastructure/
│   ├── docker/           # Dockerfiles & docker-compose (dev)
│   ├── monitoring/       # Prometheus + OpenTelemetry config
│   └── development/      # Local runner templates
├── docs/
│   ├── architecture.md
│   ├── execution-engine.md
│   ├── scenario-dsl.md
│   ├── security.md
│   ├── contributing.md
│   └── roadmap.md
├── AGENTS.md
├── README.md
└── package.json
```

## Tech stack (per product spec §4.2)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js + React |
| Styling | Tailwind CSS |
| Backend | Node.js + TypeScript |
| API | Fastify |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Queue | Redis + BullMQ |
| AI | Provider-agnostic LLM adapter |
| Browser | Playwright |
| Load engine | Grafana k6 |
| Realtime | WebSockets |
| Metrics | Prometheus-compatible |
| Tracing | OpenTelemetry |
| Object storage | S3-compatible |
| Deployment | Docker |

## MVP roadmap (per product spec §13)

1. **Phase 1 — Core foundation**: monorepo, Drizzle schema, auth, projects, environments, target verification, simulation state machine, Docker dev env.
2. **Phase 2 — Execution engine**: Playwright worker, k6 worker, Scenario DSL, workflow compiler, worker coordination, events, cancellation/recovery.
3. **Phase 3 — AI scenario generation**: LLM adapter, planner, journey builder, validation agent, approval interface.
4. **Phase 4 — Dashboard & reporting**: simulation wizard, live monitoring, charts, reports.
5. **Phase 5 — Reliability & release**: security review, reproducibility, docs, public beta, open-source release.

## Getting started

```bash
# Install dependencies
npm install

# Start dev datastore (PostgreSQL + Redis)
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Push the database schema
npm run db:push

# Run API + web
npm run dev
```

## License

MIT
