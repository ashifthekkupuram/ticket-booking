import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  text,
  pgEnum,
  unique,
  index,
  check,
  foreignKey,
} from 'drizzle-orm/pg-core';

export const eventSeatStatus = pgEnum('event_seat_status', [
  'AVAILABLE',
  'HELD',
  'BOOKED',
]);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const venue = pgTable('venue', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  ...timestamps,
});

export const seat = pgTable(
  'seat',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    venueId: uuid('venue_id')
      .notNull()
      .references(() => venue.id, { onDelete: 'restrict' }),
    section: varchar('section', { length: 50 }).notNull(),
    row: varchar('row', { length: 10 }).notNull(),
    seatNumber: integer('seat_number').notNull(),
    ...timestamps,
  },
  (table) => [
    unique('uq_seat_position').on(
      table.venueId,
      table.section,
      table.row,
      table.seatNumber,
    ),
    unique('uq_seat_id_venue').on(table.id, table.venueId),
  ],
);

export const event = pgTable(
  'event',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    venueId: uuid('venue_id')
      .notNull()
      .references(() => venue.id, { onDelete: 'restrict' }),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [
    unique('uq_event_id_venue').on(table.id, table.venueId),
    index('idx_event_starts_at').on(table.startsAt),
    check(
      'ck_event_ends_after_starts',
      sql`${table.endsAt} > ${table.startsAt}`,
    ),
  ],
);

export const eventSeat = pgTable(
  'event_seat',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').notNull(),
    seatId: uuid('seat_id').notNull(),
    venueId: uuid('venue_id').notNull(),
    price: integer('price').notNull(),
    status: eventSeatStatus('status').default('AVAILABLE').notNull(),
    ...timestamps,
  },
  (table) => [
    unique('uq_event_seat_per_event').on(table.eventId, table.seatId),
    foreignKey({
      columns: [table.eventId, table.venueId],
      foreignColumns: [event.id, event.venueId],
      name: 'fk_event_seat_event_venue',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.seatId, table.venueId],
      foreignColumns: [seat.id, seat.venueId],
      name: 'fk_event_seat_seat_venue',
    }).onDelete('restrict'),
    check('ck_event_seat_price_positive', sql`${table.price} > 0`),
  ],
);
