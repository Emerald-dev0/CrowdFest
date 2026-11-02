# Execution engine (spec §6)

## Two execution modes (spec §2)

We need two different types of simulated users because they solve different problems.

### Mode A: AI browser agents (real interactions)

Actual browser sessions controlled by executable instructions generated with AI. Best for discovering whether actual user journeys work.

- Open a website
- Navigate between pages
- Click buttons
- Enter information into forms
- Log into test accounts
- Navigate dashboards
- Verify expected content appears
- Report JavaScript errors and failed interactions

Engine: **Playwright** with isolated browser contexts.

### Mode B: Virtual users (high concurrency)

Lightweight simulated users executing predefined HTTP workflows. Best for measuring throughput, response times, and system capacity.

- Authenticate using test accounts
- Request application data
- Submit test forms
- Fetch dashboard information
- Execute API workflows
- Maintain independent test sessions
- Simulate different traffic patterns

Engine: **Grafana k6**.

## Important distinction

1,000 HTTP virtual users are not equivalent to 1,000 real browser instances. We never combine those numbers into a misleading total. The dashboard always distinguishes:

- Active browser sessions
- Active HTTP virtual users
- Total simulated sessions
- Concurrent requests

## Browser execution (spec §6.1)

Each browser worker:
1. Receives an approved browser scenario.
2. Allocates an isolated browser context.
3. Loads the designated test account.
4. Executes the approved journey.
5. Captures execution events.
6. Records failures and timings.
7. Releases its browser context.

A browser context isolates cookies and local storage from other contexts. A browser context is not the same as a separate browser process — we isolate browser processes between execution tenants or trust boundaries.

## HTTP execution (spec §6.2)

The platform compiles approved HTTP workflows into k6 scripts:

```js
import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
  const response = http.get(`${__ENV.BASE_URL}/api/dashboard`);
  check(response, {
    'dashboard responds successfully': (r) => r.status === 200,
  });
  sleep(2);
}
```

## Worker responsibilities (spec §6.3)

| Worker | Responsibility |
|--------|----------------|
| Browser worker | Playwright execution |
| HTTP worker | k6 execution |
| AI worker | Scenario generation and analysis |
| Aggregation worker | Metrics processing |
| Report worker | Report generation |

Separate worker pools prevent expensive browser workloads from interfering with lightweight HTTP workloads.

## Simulation lifecycle (spec §6.4)

Every simulation has an explicit state machine:

1. Draft
2. Validating
3. Awaiting approval
4. Queued
5. Preparing workers
6. Running
7. Stopping / Finalizing
8. Completed, Failed, or Cancelled

Every transition is persisted. The system handles worker crashes, duplicate job delivery, retries, and partially completed simulations. BullMQ provides at-least-once job delivery, so execution coordinator transitions are idempotent.

## Concurrency model (spec §7)

Four measurements, never interchangeable:

| Measurement | Meaning |
|-------------|---------|
| Concurrent browser sessions | Active browser contexts |
| Concurrent virtual users | Active workload sessions |
| Concurrent requests | Requests in flight |
| Arrival rate | New journeys per unit time |

Two workload models supported by k6:
- **Closed**: Fixed number of users repeating journeys.
- **Open**: New journeys arrive on a schedule.
