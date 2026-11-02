import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { simulations } from './simulations';

export const simulationReports = pgTable('simulation_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  simulationId: uuid('simulation_id')
    .references(() => simulations.id, { onDelete: 'cascade' })
    .notNull(),
  reportJson: jsonb('report_json').notNull(),
  storageKey: text('storage_key'), // S3-compatible object storage key
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
