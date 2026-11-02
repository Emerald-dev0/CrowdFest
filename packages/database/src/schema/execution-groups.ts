import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { simulations } from './simulations';

export const executionGroups = pgTable('execution_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  simulationId: uuid('simulation_id')
    .references(() => simulations.id, { onDelete: 'cascade' })
    .notNull(),
  engine: text('engine').notNull(), // browser | http
  workloadConfig: jsonb('workload_config').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const workerAssignments = pgTable('worker_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  executionGroupId: uuid('execution_group_id')
    .references(() => executionGroups.id, { onDelete: 'cascade' })
    .notNull(),
  workerId: text('worker_id').notNull(),
  status: text('status').notNull().default('pending'), // pending | assigned | running | completed | failed | cancelled
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
