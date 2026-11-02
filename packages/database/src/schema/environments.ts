import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { projects } from './projects';

export const environments = pgTable('environments', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(), // development | staging | production
  baseUrl: text('base_url').notNull(),
  isVerified: text('is_verified').notNull().default('false'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const targetVerifications = pgTable('target_verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  environmentId: uuid('environment_id')
    .references(() => environments.id, { onDelete: 'cascade' })
    .notNull(),
  status: text('status').notNull().default('pending'), // pending | verified | failed
  method: text('method').notNull(), // dns_txt | http_challenge | manual
  token: text('token'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
