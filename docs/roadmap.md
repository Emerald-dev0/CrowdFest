# MVP implementation roadmap (spec §13)

## Approach

We do not attempt to build everything simultaneously. The biggest risk is spending months building an impressive dashboard before we have a reliable simulation engine. The execution engine comes first.

## Phase 1 — Core foundation (1 week)

- [x] Monorepo setup (npm workspaces)
- [x] Database schema (Drizzle, all 15 tables per spec §8.2)
- [x] Authentication (placeholder org/user)
- [x] Projects and environments
- [x] Target verification
- [x] Simulation state machine
- [x] Docker development environment
- [ ] Landing page (done — dope dark-mode Next.js page)

Deliverable: developers can create projects and verified test environments.

## Phase 2 — Execution engine (2–3 weeks)

- [x] Playwright worker (browser-worker service)
- [x] k6 worker (load-worker service)
- [x] Scenario DSL (packages/scenario-dsl)
- [x] Workflow compiler (packages/scenario-compiler)
- [x] Worker coordination (orchestrator service + BullMQ)
- [x] Execution event collection
- [ ] Cancellation and failure recovery

Deliverable: manually configured journeys can execute and produce reliable measurements.

## Phase 3 — AI scenario generation (1–2 weeks)

- [x] LLM provider abstraction (OpenAI / Anthropic / mock)
- [x] Scenario planner
- [x] Journey builder
- [x] Validation agent
- [ ] Approval interface (in dashboard)
- [ ] Browser journey verification

Deliverable: developers can describe workflows in natural language.

## Phase 4 — Dashboard and reporting (2 weeks)

- [x] Simulation creation wizard
- [x] Live monitoring page
- [x] Reports page
- [ ] Performance charts (WebSocket live metrics)
- [ ] Journey results detail
- [ ] Downloadable reports

Deliverable: complete end-to-end user experience.

## Phase 5 — Reliability and release (1–2 weeks)

- [x] Security review (target verification, SSRF prevention, execution limits)
- [ ] Worker resource monitoring
- [ ] Reproducibility tests
- [ ] Failure recovery
- [x] Documentation (architecture, execution-engine, scenario-dsl, security, roadmap)
- [ ] Public beta
- [ ] Open-source release

Deliverable: a reliable, self-hostable first release.

## Suggested timeline

| Phase | Estimated duration |
|-------|-------------------|
| Foundation | 1 week |
| Execution engine | 2–3 weeks |
| AI integration | 1–2 weeks |
| Dashboard and reporting | 2 weeks |
| Reliability and release | 1–2 weeks |

These are planning estimates, not guaranteed delivery dates.

## What we deliberately leave out of v1 (spec §14)

- Distributed execution across multiple geographical regions.
- Hundreds of simultaneous real browser instances.
- Automatic production testing.
- AI agents that independently invent new actions during live tests.
- Advanced infrastructure monitoring integrations.
- Kubernetes-based customer deployments.
- Complex team permissions.
- Paid billing infrastructure.
- An elaborate plugin ecosystem.
