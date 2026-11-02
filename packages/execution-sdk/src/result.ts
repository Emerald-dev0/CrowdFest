/**
 * Execution result types (spec §11).
 */

export interface JourneyResult {
  journeyId: string;
  persona: string;
  success: boolean;
  durationMs: number;
  steps: Array<{
    stepId: string;
    action: string;
    success: boolean;
    durationMs: number;
    error?: string;
  }>;
  assertions: Array<{
    type: string;
    target: string;
    passed: boolean;
  }>;
}

export interface SimulationResult {
  simulationId: string;
  status: 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  endedAt: Date;
  durationMs: number;
  config: {
    browserSessions: number;
    virtualUsers: number;
    durationSeconds: number;
  };
  totals: {
    totalJourneys: number;
    successfulJourneys: number;
    failedJourneys: number;
    totalRequests: number;
    failedRequests: number;
  };
  latency: {
    averageMs: number;
    p50Ms: number;
    p90Ms: number;
    p95Ms: number;
    p99Ms: number;
  };
  throughput: {
    requestsPerSecond: number;
    journeysPerSecond: number;
  };
  errors: {
    rate: number;
    byCategory: Record<string, number>;
  };
  journeys: JourneyResult[];
}
