import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { event, eventSeat, seat, venue } from './schema.js';

async function main() {
  const pool = new Pool({ connectionString: process.env.EVENT_DATABASE_URL });
  const db = drizzle(pool);

  const existing = await db.select({ id: venue.id }).from(venue).limit(1);
  if (existing.length > 0) {
    console.log('Seed skipped: a venue already exists.');
    await pool.end();
    return;
  }

  await db.transaction(async (tx) => {
    const [v] = await tx
      .insert(venue)
      .values({ name: 'Grand Hall' })
      .returning();

    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seatValues = rows.flatMap((row) =>
      Array.from({ length: 10 }, (_, i) => ({
        venueId: v.id,
        section: 'Main',
        row,
        seatNumber: i + 1,
      })),
    );
    const seats = await tx.insert(seat).values(seatValues).returning();

    const startsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const endsAt = new Date(startsAt.getTime() + 3 * 60 * 60 * 1000);
    const [e] = await tx
      .insert(event)
      .values({
        name: 'Live Concert',
        description: 'Seed event for local development.',
        venueId: v.id,
        startsAt,
        endsAt,
      })
      .returning();

    // prices are in paise: 150000 = INR 1500, 100000 = INR 1000
    await tx.insert(eventSeat).values(
      seats.map((s) => ({
        eventId: e.id,
        seatId: s.id,
        venueId: v.id,
        price: s.row === 'A' || s.row === 'B' ? 150000 : 100000,
      })),
    );
  });

  console.log('Seeded 1 venue, 50 seats, 1 event, 50 event seats.');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});