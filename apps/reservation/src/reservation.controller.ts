import { Body, Controller, ParseUUIDPipe, Post, Res } from '@nestjs/common';
import { ReservationService } from './reservation.service.js';
import { UuidHeader } from './common/uuid-header.decorator.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { type Response } from 'express';
import { randomUUID } from 'crypto';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  async create(
    @UuidHeader('x-user-id', new ParseUUIDPipe()) userId: string,
    @UuidHeader('idempotency-key', new ParseUUIDPipe()) idempotencyKey: string,
    @UuidHeader('x-correlation-id', new ParseUUIDPipe({ optional: true }))
    correlationId: string | undefined,
    @Body() body: CreateReservationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { created, reservation } =
      await this.reservationService.createReservation(
        userId,
        idempotencyKey,
        correlationId ?? randomUUID(),
        body.eventId,
        body.eventSeatIds,
      );

    res.statusCode = created ? 201 : 200;

    return reservation;
  }
}
