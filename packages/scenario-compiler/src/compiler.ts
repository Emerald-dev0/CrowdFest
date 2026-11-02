/**
 * Workflow compiler (spec §5.3).
 * Compiles an approved scenario definition into executable workflows
 * for the browser worker (Playwright) and HTTP worker (k6).
 */

import { ScenarioDefinition, JourneyStep, isBrowserAction, isHttpAction } from '@crowdfest/scenario-dsl';
import { SimulationConfig } from '@crowdfest/contracts';

export interface CompiledWorkflow {
  scenarioId: string;
  executionType: 'browser' | 'http' | 'browser+http';
  browserScript?: CompiledBrowserScript;
  httpScript?: CompiledHttpScript;
}

export interface CompiledBrowserScript {
  url: string;
  steps: BrowserStep[];
  assertions: BrowserAssertion[];
  thinkTimeMs: { min: number; max: number };
}

export type BrowserStep =
  | { type: 'navigate'; url: string }
  | { type: 'click'; selector: string }
  | { type: 'fill'; selector: string; value: string }
  | { type: 'wait'; selector?: string; ms?: number }
  | { type: 'assert'; selector: string; condition: 'visible' | 'hidden' | 'text_contains'; value?: string }
  | { type: 'extract'; selector: string; attribute?: string }
  | { type: 'sleep'; ms: number };

export interface BrowserAssertion {
  type: 'element_visible' | 'element_hidden' | 'text_contains' | 'url_matches';
  target: string;
  value?: string;
}

export interface CompiledHttpScript {
  baseUrl: string;
  endpoints: HttpEndpoint[];
  thinkTimeMs: { min: number; max: number };
}

export interface HttpEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: string;
  headers?: Record<string, string>;
  expectStatus: number | number[];
}

export interface CompileOptions {
  baseUrl: string;
  testAccounts?: string[];
  thinkTimeMs?: { min: number; max: number };
}

export function compileScenario(
  scenario: ScenarioDefinition,
  options: CompileOptions,
): CompiledWorkflow {
  const browserSteps: BrowserStep[] = [];
  const httpEndpoints: HttpEndpoint[] = [];
  const assertions: BrowserAssertion[] = [];

  const thinkTime = options.thinkTimeMs ?? { min: 500, max: 2000 };

  for (const step of scenario.steps) {
    if (isBrowserAction(step.action)) {
      browserSteps.push(compileBrowserStep(step));
    }
    if (isHttpAction(step.action)) {
      httpEndpoints.push(compileHttpStep(step, options.baseUrl));
    }
  }

  for (const assertion of scenario.assertions) {
    assertions.push({
      type: assertion.type as BrowserAssertion['type'],
      target: assertion.target,
      value: undefined,
    });
  }

  return {
    scenarioId: scenario.scenario,
    executionType: scenario.executionType,
    ...(scenario.executionType === 'browser' || scenario.executionType === 'browser+http'
      ? { browserScript: { url: options.baseUrl, steps: browserSteps, assertions, thinkTimeMs: thinkTime } }
      : {}),
    ...(scenario.executionType === 'http' || scenario.executionType === 'browser+http'
      ? { httpScript: { baseUrl: options.baseUrl, endpoints: httpEndpoints, thinkTimeMs: thinkTime } }
      : {}),
  };
}

function compileBrowserStep(step: JourneyStep): BrowserStep {
  switch (step.action) {
    case 'navigate':
      return { type: 'navigate', url: step.target.startsWith('http') ? step.target : step.target };
    case 'click':
      return { type: 'click', selector: step.target };
    case 'fill':
      return { type: 'fill', selector: step.target, value: step.data ?? '' };
    case 'wait':
      return { type: 'wait', selector: undefined, ms: step.sleepMs };
    case 'assert':
      return {
        type: 'assert',
        selector: step.target,
        condition: (step.assertionType ?? 'element_visible') as 'visible' | 'hidden' | 'text_contains',
        value: step.data,
      };
    case 'extract':
      return { type: 'extract', selector: step.target };
    case 'sleep':
      return { type: 'sleep', ms: step.sleepMs ?? 1000 };
    default:
      return { type: 'sleep', ms: 1000 };
  }
}

function compileHttpStep(step: JourneyStep, baseUrl: string): HttpEndpoint {
  return {
    method: 'GET',
    path: step.target.startsWith('http') ? step.target : step.target,
    expectStatus: 200,
  };
}
