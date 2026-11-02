# Scenario DSL (spec §5.2, §5.3)

## Journey steps

A structured, executable step that the browser worker or k6 worker can run.

```ts
interface JourneyStep {
  id: string;
  action: 'navigate' | 'click' | 'fill' | 'wait' | 'assert' | 'extract' | 'sleep' | 'request' | 'check';
  target: string;
  data?: string;
  assertionType?: 'element_visible' | 'element_hidden' | 'text_contains' | 'url_matches' | 'status_equals';
  sleepMs?: number;
  critical?: boolean;
}
```

Example — shopping journey (spec §5.2):

```json
{
  "scenario": "shopping_journey",
  "steps": [
    { "action": "navigate", "target": "/" },
    { "action": "click", "target": "search" },
    { "action": "fill", "target": "search_input", "data": "test product" },
    { "action": "click", "target": "product_result" },
    { "action": "click", "target": "add_to_cart" }
  ],
  "assertions": [
    { "type": "element_visible", "target": "cart" }
  ]
}
```

## Scenario definition

```ts
interface ScenarioDefinition {
  scenario: string;
  steps: JourneyStep[];
  assertions: ScenarioAssertion[];
  executionType: 'browser' | 'http' | 'browser+http';
  successCondition?: string;
  testAccounts?: string[];
  personas?: Persona[];
  thinkTimeMs?: { min: number; max: number };
}
```

## Workflow compiler (spec §5.3)

The generated scenario is compiled into an executable workflow:

```
Natural language
      ▼
Scenario planner
      ▼
Structured journey
      ▼
Schema validation
      ▼
Developer approval
      ▼
Workflow compiler
      ├──▶ Playwright worker → Browser session
      └──▶ k6 script        → Virtual user
                                 ▼
                          Test results
```

Key properties:
- Predictable execution (no continuous AI inference during tests)
- Lower AI costs
- Reproducibility
- Better debugging
- Easier scaling
- Fewer unpredictable agent actions

The browser worker can optionally request AI assistance during scenario preparation, but it should not make arbitrary decisions while a high-concurrency test is running.

## Agent personas (spec §5.4)

Personas describe behaviour profiles, not necessarily different LLM agents:

| Persona | Behaviour |
|---------|-----------|
| New visitor | Homepage and registration |
| Returning user | Login and dashboard |
| Explorer | Search and browse |
| Active user | Repeated application interactions |
| Occasional user | Infrequent visits |

Each persona becomes a reusable workload definition. The platform assigns a distribution of these profiles to the simulated population.
