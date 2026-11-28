import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  integer,
  varchar,
  text,
  timestamp,
  pgEnum,
  unique,
  check,
  index,
  uniqueIndex,
  foreignKey,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const paymentStatus = pgEnum('payment_status', [
  'PENDING',
  'SUCCEEDED',
  'REFUNDED',
  'FAILED',
  'REFUND_REQUESTED',
]);
export const paymentAttemptStatus = pgEnum('payment_attempt_status', [
  'PENDING',
  'SUCCEEDED',
  'FAILED',
]);
export const refundStatus = pgEnum('refund_status', [
  'PENDING',
  'SUCCEEDED',
  'FAILED',
]);

export const payment = pgTable(
  'payment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reservationId: uuid('reservation_id').notNull(),
    amount: integer('amount').notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    status: paymentStatus('status').default('PENDING').notNull(),
    ...timestamps,
  },
  (table) => [
    unique('uq_payment_reservation').on(table.reservationId),
    unique('uq_payment_id_amount').on(table.id, table.amount),
    check('ck_payment_amount_positive', sql`${table.amount} > 0`),
  ],
);

export const paymentAttempt = pgTable(
  'payment_attempt',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    paymentId: uuid('payment_id').notNull(),
    providerName: varchar('provider_name', { length: 50 }),
    providerId: text('provider_id'),
    status: paymentAttemptStatus('status').default('PENDING').notNull(),
    failedReason: text('failed_reason'),
    ...timestamps,
  },
  (table) => [
    foreignKey({
      name: 'fk_payment_attempt_payment',
      columns: [table.paymentId],
      foreignColumns: [payment.id],
    }),
    index('idx_payment_attempt_pending_created_at')
      .on(table.createdAt)
      .where(sql`${table.status} = 'PENDING'`),
    unique('uq_payment_attempt_provider').on(
      table.providerName,
      table.providerId,
    ),
    index('idx_payment_attempt_payment_id').on(table.paymentId),
    uniqueIndex('uq_payment_attempt_live')
      .on(table.paymentId)
      .where(sql`${table.status} IN ('PENDING','SUCCEEDED')`),
    check(
      'ck_payment_attempt_provider_both_or_none',
      sql`(${table.providerName} IS NOT NULL AND ${table.providerId} IS NOT NULL) OR (${table.providerName} IS NULL AND ${table.providerId} IS NULL)`,
    ),
  ],
);

export const refund = pgTable(
  'refund',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    paymentId: uuid('payment_id').notNull(),
    amount: integer('amount').notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    requestedAt: timestamp('requested_at', { withTimezone: true }).notNull(),
    status: refundStatus('status').default('PENDING').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    failedAt: timestamp('failed_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    foreignKey({
      columns: [table.paymentId, table.amount],
      foreignColumns: [payment.id, payment.amount],
      name: 'fk_refund_payment_amount',
    }),
    index('idx_refund_payment_id').on(table.paymentId),
    uniqueIndex('uq_refund_active')
      .on(table.paymentId)
      .where(sql`${table.status} IN ('PENDING', 'SUCCEEDED')`),
    check('ck_refund_amount_positive', sql`${table.amount} > 0`),
    check(
      'ck_refund_completed_at',
      sql`(${table.status} = 'SUCCEEDED') = (${table.completedAt} IS NOT NULL)`,
    ),
    check(
      'ck_refund_failed_at',
      sql`(${table.status} = 'FAILED') = (${table.failedAt} IS NOT NULL)`,
    ),
  ],
);
