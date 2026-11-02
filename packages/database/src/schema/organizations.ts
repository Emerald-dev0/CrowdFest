import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  plan: text('plan').notNull().default('free'), // free | pro | team
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  role: text('role').notNull().default('member'), // owner | admin | member
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
