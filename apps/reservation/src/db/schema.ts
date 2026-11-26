import { sql } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  uuid,
  pgEnum,
  unique,
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

export const reservationStatus = pgEnum('reservation_status', [
  'PENDING',
  'CANCELLED',
  'CONFIRMED',
  'FAILED',
  'EXPIRED',
]);

export const reservation = pgTable(
  'reservation',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    eventId: uuid('event_id').notNull(),
    status: reservationStatus('status').default('PENDING').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    idempotencyKey: uuid('idempotency_key').notNull(),
    ...timestamps,
  },
  (table) => [
    unique('uq_reservation_user_idempotency').on(
      table.userId,
      table.idempotencyKey,
    ),
    index('idx_reservation_pending_expires_at')
      .on(table.expiresAt)
      .where(sql`${table.status} = 'PENDING'`),
  ],
);

export const reservationSeat = pgTable(
  'reservation_seat',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reservationId: uuid('reservation_id').notNull(),
    eventSeatId: uuid('event_seat_id').notNull(),
    status: reservationStatus('status').default('PENDING').notNull(),
    ...timestamps,
  },
  (table) => [
    foreignKey({
      name: 'fk_reservation_seat_reservation',
      columns: [table.reservationId],
      foreignColumns: [reservation.id],
    }).onDelete('cascade'),
    index('idx_reservation_seat_reservation_id').on(table.reservationId),
    uniqueIndex('uq_reservation_seat_active')
      .on(table.eventSeatId)
      .where(sql`${table.status} IN ('PENDING','CONFIRMED')`),
  ],
);
