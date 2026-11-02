# Architecture (spec §4)

## High-level architecture

We build a **modular monolith** for the control plane, with independently deployable execution workers. There is no reason to start with 15 microservices.

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│              Dashboard · Scenario builder · Reports         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 API / Control Plane (Fastify)               │
│       Auth · Projects · Simulations · Scheduling · Verify   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
│   AI Service    │ │ Orchestrator │ │   WebSockets │
│ Scenario gen    │ │ State machine│ │   Live feed  │
│ Validation      │ │ Job queues   │ │              │
│ Analysis        │ │              │ │              │
└─────────────────┘ └──────────────┘ └──────────────┘
              │               │
              ▼               ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
│ Browser worker  │ │  Load worker │ │ Metrics wkr  │
│   Playwright    │ │     k6       │ │   Aggregation│
│ Real browsers   │ │ HTTP load    │ │   Report wkr │
└─────────────────┘ └──────────────┘ └──────────────┘
              │               │               │
              └───────────────┴───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         PostgreSQL · Redis · BullMQ · S3-compatible         │
└─────────────────────────────────────────────────────────────┘
```

## Tech stack (spec §4.2)

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| Frontend | Next.js + React | Dashboard |
| Styling | Tailwind CSS | Interface |
| Backend | Node.js + TypeScript | Control plane |
| API | Fastify | HTTP API |
| Database | PostgreSQL | Persistent data |
| ORM | Drizzle ORM | Database access |
| Queue | Redis + BullMQ | Job coordination |
| AI | Provider-agnostic LLM adapter | Scenario generation |
| Browser | Playwright | Real browser execution |
| Load engine | Grafana k6 | HTTP load generation |
| Realtime | WebSockets | Live dashboard |
| Metrics | Prometheus-compatible | Performance monitoring |
| Tracing | OpenTelemetry | Execution observability |
| Object storage | S3-compatible | Reports and artifacts |
| Deployment | Docker | Reproducible workers |

## Why these choices

- **Playwright**: Browser contexts provide isolated cookies, storage, and sessions — important when simulating independent users.
- **k6**: Supports realistic workload scenarios and browser/protocol-level testing. We use it as a proven execution engine instead of reinventing load generation.
- **BullMQ**: Provides distributed job processing, worker concurrency, retries, cancellation, and observability integrations.
- **OpenTelemetry**: Gives us a standard way to correlate traces, metrics, and logs throughout the platform.

## Repository structure (spec §12)

```
crowdfest/
├── apps/
│   ├── web/          # Next.js dashboard
│   ├── api/          # Fastify control-plane API
│   └── cli/          # Developer CLI (planned)
├── services/
│   ├── ai-service/         # Scenario generation & analysis
│   ├── orchestrator/       # Simulation coordination & state machine
│   ├── browser-worker/     # Playwright real-browser execution
│   ├── load-worker/        # k6 HTTP load generation
│   ├── metrics-worker/     # Result processing & aggregation
│   └── report-worker/      # Report generation
├── packages/
│   ├── contracts/        # Shared TypeScript/Zod schemas
│   ├── database/         # Drizzle ORM schema + migrations
│   ├── scenario-dsl/     # Journey step definitions
│   ├── scenario-compiler/# Workflow compiler (DSL → Playwright/k6)
│   ├── execution-sdk/    # Worker interfaces
│   ├── metrics/          # Metric definitions
│   ├── security/         # Target verification, SSRF rules, limits
│   └── config/           # Shared configuration
├── infrastructure/
│   ├── docker/           # Dockerfiles & docker-compose
│   ├── monitoring/       # Prometheus + OpenTelemetry config
│   └── development/      # Local runner templates
└── docs/
    ├── architecture.md
    ├── execution-engine.md
    ├── scenario-dsl.md
    ├── security.md
    ├── contributing.md
    └── roadmap.md
```
