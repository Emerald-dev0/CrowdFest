/**
 * Scenario definition (spec §3.2, §5.2).
 * The structured intermediate representation produced by the AI planner
 * and approved by the developer before execution.
 */

import { JourneyStep } from './steps';
import { Persona } from './persona';

export type ExecutionType = 'browser' | 'http' | 'browser+http';

export interface ScenarioAssertion {
  type: 'element_visible' | 'element_hidden' | 'text_contains' | 'url_matches' | 'status_equals';
  target: string;
}

export interface ScenarioDefinition {
  scenario: string;
  steps: JourneyStep[];
  assertions: ScenarioAssertion[];
  executionType: ExecutionType;
  successCondition?: string;
  testAccounts?: string[];
  personas?: Persona[];
  thinkTimeMs?: { min: number; max: number };
}

export interface ScenarioVersion {
  id: string;
  scenarioId: string;
  version: number;
  definition: ScenarioDefinition;
  aiGenerated: boolean;
  approved: boolean;
  approvedAt?: Date;
  createdAt: Date;
}

export interface Scenario {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  versions: ScenarioVersion[];
}
