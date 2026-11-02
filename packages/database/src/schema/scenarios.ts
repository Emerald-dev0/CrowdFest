import { pgTable, uuid, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { projects } from './projects';

export const scenarios = pgTable('scenarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const scenarioVersions = pgTable('scenario_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  scenarioId: uuid('scenario_id')
    .references(() => scenarios.id, { onDelete: 'cascade' })
    .notNull(),
  version: integer('version').notNull(),
  definitionJson: jsonb('definition_json').notNull(), // structured journey DSL
  aiGenerated: text('ai_generated').notNull().default('false'),
  approved: text('approved').notNull().default('false'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
