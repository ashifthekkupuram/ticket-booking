import { Injectable, Inject } from '@nestjs/common';
import { or, ilike, and, asc, gte, eq } from 'drizzle-orm';

import { type Db, DB } from './db/db.module.js';
import { event, venue } from './db/schema.js';
import { escapeLike } from './common/escape-like.js';

const EVENTS_PAGE_SIZE = 10;

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
      .where(conditions)
      .innerJoin(venue, eq(event.venueId, venue.id))
      .orderBy(asc(event.startsAt), asc(event.id))
      .offset(offset)
      .limit(EVENTS_PAGE_SIZE);

    const totalEvents = await this.db.$count(event, conditions);

    const hasMore = offset + events.length < totalEvents;

    return { events, hasMore };
  }
}
