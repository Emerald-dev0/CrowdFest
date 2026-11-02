/**
 * Job types for BullMQ coordination (spec §4.1, §6.4).
 */

import { WorkerType } from './worker';
import { ScenarioDefinition } from '@crowdfest/scenario-dsl';
import { SimulationConfig } from '@crowdfest/contracts';

export type JobType =
  | 'simulation.start'
  | 'simulation.cancel'
  | 'browser.execute'
  | 'http.execute'
  | 'ai.generate'
  | 'ai.validate'
  | 'metrics.aggregate'
  | 'report.generate';

export interface SimulationJobData {
  simulationId: string;
  projectId: string;
  scenarioVersionId: string;
  config: SimulationConfig;
}

export interface BrowserJobData extends SimulationJobData {
  scenario: ScenarioDefinition;
  sessions: number;
}

export interface HttpJobData extends SimulationJobData {
  scenario: ScenarioDefinition;
  virtualUsers: number;
}

export interface JobResult {
  jobId: string;
  status: 'completed' | 'failed' | 'cancelled';
  result?: Record<string, unknown>;
  error?: string;
  completedAt: Date;
}
