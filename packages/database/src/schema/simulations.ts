import { pgTable, uuid, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { projects } from './projects';
import { scenarioVersions } from './scenarios';
import { environments } from './environments';

export const simulations = pgTable('simulations', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  scenarioVersionId: uuid('scenario_version_id')
    .references(() => scenarioVersions.id)
    .notNull(),
  name: text('name').notNull(),
  status: text('status').notNull().default('draft'), // draft | validating | awaiting_approval | queued | preparing_workers | running | stopping | finalizing | completed | failed | cancelled
  requestedWorkload: jsonb('requested_workload'),
  approvedWorkload: jsonb('approved_workload'),
  actualWorkload: jsonb('actual_workload'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  engineVersions: jsonb('engine_versions'),
  thresholdConfig: jsonb('threshold_config'),
  environmentId: uuid('environment_id').references(() => environments.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
