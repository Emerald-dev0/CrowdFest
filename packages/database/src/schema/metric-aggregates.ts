import { pgTable, uuid, text, timestamp, integer, real } from 'drizzle-orm/pg-core';
import { simulations } from './simulations';

export const metricAggregates = pgTable('metric_aggregates', {
  id: uuid('id').primaryKey().defaultRandom(),
  simulationId: uuid('simulation_id')
    .references(() => simulations.id, { onDelete: 'cascade' })
    .notNull(),
  metricName: text('metric_name').notNull(), // active_http_users | active_browser_sessions | rps | p95_latency_ms | error_rate
  timeBucket: timestamp('time_bucket', { withTimezone: true }).notNull(),
  value: real('value').notNull(),
});
