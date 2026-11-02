import { z } from 'zod';

export const SimulationStatusSchema = z.enum([
  'draft',
  'validating',
  'awaiting_approval',
  'queued',
  'preparing_workers',
  'running',
  'stopping',
  'finalizing',
  'completed',
  'failed',
  'cancelled',
]);

export type SimulationStatus = z.infer<typeof SimulationStatusSchema>;

export const SimulationConfigSchema = z.object({
  name: z.string(),
  target: z.string().url(),
  engines: z.object({
    browser: z.object({
      enabled: z.boolean().default(false),
      sessions: z.number().min(0).default(0),
    }),
    http: z.object({
      enabled: z.boolean().default(false),
      virtualUsers: z.number().min(0).default(0),
    }),
  }),
  workload: z.object({
    model: z.enum(['closed', 'open']),
    durationSeconds: z.number().positive(),
    rampUpSeconds: z.number().nonnegative().optional(),
  }),
  thresholds: z.object({
    p95LatencyMs: z.number().positive(),
    errorRatePercent: z.number().min(0).max(100),
  }),
});

export type SimulationConfig = z.infer<typeof SimulationConfigSchema>;

export const MetricsSnapshotSchema = z.object({
  activeHttpUsers: z.number(),
  activeBrowserSessions: z.number(),
  totalSimulatedSessions: z.number(),
  concurrentRequests: z.number(),
  requestsPerSecond: z.number(),
  p95LatencyMs: z.number(),
  p99LatencyMs: z.number().optional(),
  errorRate: z.number(),
});

export type MetricsSnapshot = z.infer<typeof MetricsSnapshotSchema>;
