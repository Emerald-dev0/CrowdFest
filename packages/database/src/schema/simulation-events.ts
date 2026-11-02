import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { simulations } from './simulations';

export const simulationEvents = pgTable('simulation_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  simulationId: uuid('simulation_id')
    .references(() => simulations.id, { onDelete: 'cascade' })
    .notNull(),
  eventType: text('event_type').notNull(), // browser_agent.completed | virtual_user.completed | error | stage_changed | metrics.updated
  payload: jsonb('payload').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});
