import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const inboxEvent = pgTable('inbox_event', {
  eventId: uuid('event_id').primaryKey(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
