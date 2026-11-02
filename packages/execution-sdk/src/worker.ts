/**
 * Worker interfaces (spec §6.3).
 * Common contract that all execution workers implement.
 */

import { ScenarioDefinition } from '@crowdfest/scenario-dsl';
import { SimulationConfig } from '@crowdfest/contracts';

export type WorkerType = 'browser' | 'http' | 'ai' | 'aggregation' | 'report';

export interface WorkerInfo {
  id: string;
  type: WorkerType;
  version: string;
  capacity: number;
  healthy: boolean;
}

export interface WorkerJob {
  id: string;
  type: WorkerType;
  simulationId: string;
  scenario: ScenarioDefinition;
  config: SimulationConfig;
  payload: Record<string, unknown>;
}

export interface WorkerResult {
  jobId: string;
  workerId: string;
  success: boolean;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  events: WorkerEvent[];
  metrics: Record<string, number>;
  error?: string;
}

export interface WorkerEvent {
  timestamp: Date;
  type: string;
  payload: Record<string, unknown>;
}

export interface Worker {
  id: string;
  type: WorkerType;
  health(): Promise<WorkerInfo>;
  execute(job: WorkerJob): Promise<WorkerResult>;
}
