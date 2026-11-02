import { z } from 'zod';

export const MetricNameSchema = z.enum([
  'active_http_users',
  'active_browser_sessions',
  'total_simulated_sessions',
  'concurrent_requests',
  'requests_per_second',
  'p50_latency_ms',
  'p90_latency_ms',
  'p95_latency_ms',
  'p99_latency_ms',
  'error_rate',
  'browser_errors',
  'completed_iterations',
]);

export type MetricName = z.infer<typeof MetricNameSchema>;

export const MetricAggregateSchema = z.object({
  simulationId: z.string().uuid(),
  metricName: MetricNameSchema,
  timeBucket: z.string().datetime(),
  value: z.number(),
});

export type MetricAggregate = z.infer<typeof MetricAggregateSchema>;

export const SimulationEventSchema = z.object({
  type: z.string(),
  simulationId: z.string().uuid(),
  timestamp: z.string().datetime(),
  payload: z.record(z.unknown()),
});

export type SimulationEvent = z.infer<typeof SimulationEventSchema>;
