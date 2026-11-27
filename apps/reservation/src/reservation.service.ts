import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { OutboxService } from '@app/outbox';
import { ConfigService } from '@nestjs/config';
import { type Db, DB } from './db/db.module.js';
import { reservation, reservationSeat } from './db/schema.js';
import { EventClient } from './event.client.js';
import { uniqueViolation } from './common/unique-violation.js';

type ReservationResponse = {
  id: string;
  status: string;
  expiresAt: string;
  totalAmount: number;
  currency: string;
  seats: { eventSeatId: string; price: number }[];
};

@Injectable()
export class ReservationService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly eventClient: EventClient,
    private readonly outbox: OutboxService,
    private readonly config: ConfigService,
  ) {}

  async createReservation(
    userId: string,
    idempotencyKey: string,
    correlationId: string,
    eventId: string,
    eventSeatIds: string[],
  ): Promise<{ reservation: ReservationResponse; created: boolean }> {
    const exist = await this.findExisting(userId, idempotencyKey);

    if (exist) {
      return { created: false, reservation: exist };
    }

    const currency = this.config.getOrThrow<string>('CURRENCY');
    const ttlMinutes = Number(
      this.config.getOrThrow<string>('RESERVATION_TTL_MINUTES'),
    );

    const seatPrices = await this.eventClient.getSeatPrices(eventSeatIds);

    if (seatPrices.length !== eventSeatIds.length) {
      throw new BadRequestException('Seat prices do not match the request');
    }

    if (seatPrices.some((v) => v.eventId !== eventId)) {
      throw new BadRequestException('Seats do not belong to this event');
    }

    let result: ReservationResponse;

    try {
      result = await this.db.transaction(async (tx) => {
        const [newReservation] = await tx
          .insert(reservation)
          .values({
            userId,
            eventId,
            idempotencyKey,
            expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
          })
          .returning();

        const newSeats = await tx
          .insert(reservationSeat)
          .values(
            seatPrices.map((v) => ({
              reservationId: newReservation.id,
              eventSeatId: v.eventSeatId,
              price: v.price,
            })),
          )
          .returning({
            eventSeatId: reservationSeat.eventSeatId,
            price: reservationSeat.price,
          });

        const totalAmount = newSeats.reduce((total, v) => total + v.price, 0);

        await this.outbox.add(tx, {
          event_type: 'reservation.created',
          correlation_id: correlationId,
          aggregate_id: newReservation.id,
          aggregate_type: 'reservation',
          payload: {
            reservation_id: newReservation.id,
            currency,
            event_id: eventId,
            expires_at: newReservation.expiresAt.toISOString(),
            total_amount: totalAmount,
            user_id: userId,
            seats: seatPrices.map((v) => ({
              event_seat_id: v.eventSeatId,
              price: v.price,
            })),
          },
        });

        return {
          id: newReservation.id,
          currency,
          status: newReservation.status,
          expiresAt: newReservation.expiresAt.toISOString(),
          seats: newSeats,
          totalAmount,
        };
      });
    } catch (error) {
      const constraint = uniqueViolation(error);

      if (constraint === 'uq_reservation_seat_active') {
        throw new ConflictException(
          'One or more seats are no longer available',
        );
      }

      if (constraint === 'uq_reservation_user_idempotency') {
        const replay = await this.findExisting(userId, idempotencyKey);
        if (replay) return { created: false, reservation: replay };
      }

      throw error;
    }

    return { created: true, reservation: result };
  }

  private async findExisting(
    userId: string,
    idempotencyKey: string,
  ): Promise<ReservationResponse | undefined> {
    const [row] = await this.db
      .select()
      .from(reservation)
      .where(
        and(
          eq(reservation.userId, userId),
          eq(reservation.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1);

    if (!row) return undefined;

    const seats = await this.db
      .select({
        eventSeatId: reservationSeat.eventSeatId,
        price: reservationSeat.price,
      })
      .from(reservationSeat)
      .where(eq(reservationSeat.reservationId, row.id))
      .orderBy(reservationSeat.createdAt);

    const currency = this.config.getOrThrow<string>('CURRENCY');

    return {
      id: row.id,
      currency,
      status: row.status,
      expiresAt: row.expiresAt.toISOString(),
      seats: seats,
      totalAmount: seats.reduce((total, s) => total + s.price, 0),
    };
  }
}
