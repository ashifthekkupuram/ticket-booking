import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';

import type { AnyEnvelope } from '@app/contracts';
import { InboxService, type InboxTx } from '@app/inbox';
import { KafkaConsumerService } from '@app/kafka';
import { eventSeat } from './db/schema.js';

type SeatStatus = (typeof eventSeat.$inferSelect)['status'];

const GROUP_ID = 'event-service';

@Injectable()
export class EventConsumerService implements OnModuleInit {
    private readonly logger = new Logger(EventConsumerService.name)

    constructor(private readonly consumer: KafkaConsumerService, private readonly inbox: InboxService) { }

    async onModuleInit() {
        await this.consumer.subscribe(GROUP_ID, ['reservation.created', 'ticket.issued', 'booking.failed'], (envelope) => this.dispatch(envelope))
    }

    private async dispatch(envelope: AnyEnvelope) {
        switch (envelope.event_type) {
            case 'reservation.created':
                await this.inbox.handle(envelope, (tx, payload) =>
                    this.transition(
                        tx,
                        payload.seats.map((seat) => seat.event_seat_id),
                        'AVAILABLE',
                        'HELD',
                    ),
                );
                return;
            case 'ticket.issued':
                await this.inbox.handle(envelope, (tx, payload) =>
                    this.transition(tx, payload.event_seat_ids, 'HELD', 'BOOKED'),
                );
                return;
            case 'booking.failed':
                await this.inbox.handle(envelope, (tx, payload) =>
                    this.transition(tx, payload.event_seat_ids, 'HELD', 'AVAILABLE'),
                );
                return;
            default:
                this.logger.warn(`Ignoring unexpected event ${envelope.event_type}`);
        }
    }

    private async transition(
        tx: InboxTx,
        ids: string[],
        from: SeatStatus,
        to: SeatStatus
    ) {

        if (ids.length === 0) return;

        const updated = await tx.update(eventSeat).set({ status: to, updatedAt: new Date() }).where(and(inArray(eventSeat.id, ids), eq(eventSeat.status, from))).returning({ id: eventSeat.id })

        if (updated.length !== ids.length) {
            this.logger.warn(
                `Expected ${ids.length} seats ${from} -> ${to}, changed ${updated.length}`,
            );
        }

    }

}