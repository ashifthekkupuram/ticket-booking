import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { or, ilike, and, asc, gte, eq, inArray } from 'drizzle-orm';

import { type Db, DB } from './db/db.module.js';
import { event, venue, eventSeat, seat } from './db/schema.js';
import { escapeLike } from './common/escape-like.js';
import { EVENTS_PAGE_SIZE } from './common/constants.js';

@Injectable()
export class EventService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async getEvents(page: number = 1, search?: string) {
    const offset = EVENTS_PAGE_SIZE * (page - 1);

    const pattern = search ? `%${escapeLike(search)}%` : undefined;

    const now = new Date();

    const conditions = and(
      pattern
        ? or(ilike(event.name, pattern), ilike(event.description, pattern))
        : undefined,
      gte(event.startsAt, now),
    );

    const events = await this.db
      .select({
        id: event.id,
        name: event.name,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        venue: { id: venue.id, name: venue.name },
      })
      .from(event)
      .innerJoin(venue, eq(event.venueId, venue.id))
      .where(conditions)
      .orderBy(asc(event.startsAt), asc(event.id))
      .offset(offset)
      .limit(EVENTS_PAGE_SIZE);

    const totalEvents = await this.db.$count(event, conditions);

    const hasMore = offset + events.length < totalEvents;

    return { events, hasMore };
  }

  async getEventSeats(id: string) {
    const [eventExist] = await this.db
      .select({ id: event.id })
      .from(event)
      .where(eq(event.id, id))
      .limit(1);

    if (!eventExist) {
      throw new NotFoundException('Event Not Found');
    }

    const seats = await this.db
      .select({
        id: eventSeat.id,
        price: eventSeat.price,
        seat: {
          section: seat.section,
          row: seat.row,
          seatNumber: seat.seatNumber,
        },
        status: eventSeat.status,
      })
      .from(eventSeat)
      .innerJoin(seat, eq(eventSeat.seatId, seat.id))
      .where(eq(eventSeat.eventId, id))
      .orderBy(asc(seat.section), asc(seat.row), asc(seat.seatNumber));

    return { seats };
  }

  async getEventSeatsPrices(ids: string[]) {
    const duplicateExist = ids.length !== new Set(ids).size;

    if (duplicateExist) {
      throw new BadRequestException('Duplicate Id exist');
    }

    const seats = await this.db
      .select({
        eventSeatId: eventSeat.id,
        price: eventSeat.price,
        eventId: eventSeat.eventId,
      })
      .from(eventSeat)
      .where(inArray(eventSeat.id, ids));

    const existingSeatsIds = new Set(seats.map((s) => s.eventSeatId));
    const missingSeats = ids.filter((id) => !existingSeatsIds.has(id));

    if (missingSeats.length > 0) {
      throw new NotFoundException(
        `Event seats not found: ${missingSeats.join(',')}`,
      );
    }

    return { seatPrices: seats };
  }
}
