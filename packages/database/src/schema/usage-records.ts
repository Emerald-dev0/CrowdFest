import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { simulations } from './simulations';

export const usageRecords = pgTable('usage_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  simulationId: uuid('simulation_id').references(() => simulations.id),
  resourceType: text('resource_type').notNull(), // browser_session_hour | http_user_hour | ai_inference_token
  quantity: integer('quantity').notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
});
