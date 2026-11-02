/**
 * Workload configuration (spec §3.3, §7.2).
 * Defines how the simulated population behaves over time.
 */

export type WorkloadModel = 'closed' | 'open';

export type TrafficPattern =
  | 'gradual_ramp_up'
  | 'constant_load'
  | 'gradual_ramp_down'
  | 'short_burst'
  | 'sustained_load';

export interface WorkloadConfig {
  model: WorkloadModel;
  durationSeconds: number;
  rampUpSeconds?: number;
  rampDownSeconds?: number;
  trafficPattern: TrafficPattern;
  thinkTimeMs?: { min: number; max: number };
  sessionDurationMs?: { min: number; max: number };
  requestFrequency?: { minMs: number; maxMs: number };
}

export interface PopulationProfile {
  personaId: string;
  percentage: number;
}

export interface CrowdConfiguration {
  name: string;
  target: string;
  engines: {
    browser: { enabled: boolean; sessions: number };
    http: { enabled: boolean; virtualUsers: number };
  };
  workload: WorkloadConfig;
  population: PopulationProfile[];
  thresholds: {
    p95LatencyMs: number;
    errorRatePercent: number;
  };
}

export const DEFAULT_WORKLOAD: WorkloadConfig = {
  model: 'closed',
  durationSeconds: 120,
  rampUpSeconds: 30,
  trafficPattern: 'gradual_ramp_up',
  thinkTimeMs: { min: 500, max: 2000 },
  sessionDurationMs: { min: 10000, max: 60000 },
};
