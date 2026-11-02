/**
 * Metric definitions (spec §7.1, §11).
 * The four concurrency measurements are never combined into a misleading total.
 */

export type MetricName =
  | 'active_http_users'
  | 'active_browser_sessions'
  | 'total_simulated_sessions'
  | 'concurrent_requests'
  | 'arrival_rate'
  | 'requests_per_second'
  | 'p50_latency_ms'
  | 'p90_latency_ms'
  | 'p95_latency_ms'
  | 'p99_latency_ms'
  | 'error_rate'
  | 'browser_errors'
  | 'completed_iterations';

export interface MetricDefinition {
  name: MetricName;
  unit: string;
  description: string;
  higherIsBetter: boolean;
}

export const METRIC_DEFINITIONS: Record<MetricName, MetricDefinition> = {
  active_http_users: {
    name: 'active_http_users',
    unit: 'users',
    description: 'Number of active HTTP virtual user sessions',
    higherIsBetter: false,
  },
  active_browser_sessions: {
    name: 'active_browser_sessions',
    unit: 'sessions',
    description: 'Number of active real-browser sessions',
    higherIsBetter: false,
  },
  total_simulated_sessions: {
    name: 'total_simulated_sessions',
    unit: 'sessions',
    description: 'Total simulated sessions (browser + HTTP)',
    higherIsBetter: false,
  },
  concurrent_requests: {
    name: 'concurrent_requests',
    unit: 'requests',
    description: 'Requests currently in flight',
    higherIsBetter: false,
  },
  arrival_rate: {
    name: 'arrival_rate',
    unit: 'journeys/sec',
    description: 'New user journeys starting per second',
    higherIsBetter: false,
  },
  requests_per_second: {
    name: 'requests_per_second',
    unit: 'req/s',
    description: 'Throughput - requests per second',
    higherIsBetter: true,
  },
  p50_latency_ms: {
    name: 'p50_latency_ms',
    unit: 'ms',
    description: 'Median response latency',
    higherIsBetter: false,
  },
  p90_latency_ms: {
    name: 'p90_latency_ms',
    unit: 'ms',
    description: '90th percentile response latency',
    higherIsBetter: false,
  },
  p95_latency_ms: {
    name: 'p95_latency_ms',
    unit: 'ms',
    description: '95th percentile response latency',
    higherIsBetter: false,
  },
  p99_latency_ms: {
    name: 'p99_latency_ms',
    unit: 'ms',
    description: '99th percentile response latency',
    higherIsBetter: false,
  },
  error_rate: {
    name: 'error_rate',
    unit: '%',
    description: 'Percentage of failed requests/journeys',
    higherIsBetter: false,
  },
  browser_errors: {
    name: 'browser_errors',
    unit: 'count',
    description: 'Number of browser-side errors (JS errors, failed interactions)',
    higherIsBetter: false,
  },
  completed_iterations: {
    name: 'completed_iterations',
    unit: 'count',
    description: 'Number of completed user journey iterations',
    higherIsBetter: true,
  },
};

export interface MetricSnapshot {
  simulationId: string;
  metricName: MetricName;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface ThresholdConfig {
  p95LatencyMs: number;
  errorRatePercent: number;
}

export interface CapacityObservation {
  highestPassedWorkload: number;
  firstFailedWorkload: number;
  breachedMetric: MetricName | null;
  generatorHealthy: boolean;
  affectedJourneys: string[];
}
