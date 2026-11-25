import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  jsonb,
  pgEnum,
  integer,
  index,
} from 'drizzle-orm/pg-core';

export const outboxEventStatus = pgEnum('outbox_event_status', [
  'PENDING',
  'PUBLISHED',
  'FAILED',
]);

export const outboxEvent = pgTable(
  'outbox_event',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    aggregateId: uuid('aggregate_id').notNull(),
    aggregateType: varchar('aggregate_type', { length: 50 }).notNull(),
    correlationId: uuid('correlation_id').notNull(),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    status: outboxEventStatus('status').default('PENDING').notNull(),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    retryCount: integer('retry_count').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_outbox_status_created_at').on(table.status, table.createdAt),
  ],
);
