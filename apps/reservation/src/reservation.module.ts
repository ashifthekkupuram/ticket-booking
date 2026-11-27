import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ReservationController } from './reservation.controller.js';
import { ReservationService } from './reservation.service.js';
import { DbModule, DB } from './db/db.module.js';
import { KafkaModule } from '@app/kafka';
import { InboxModule } from '@app/inbox';
import { OutboxModule } from '@app/outbox';
import { EventClient } from './event.client.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    KafkaModule.forRoot({ clientId: 'reservation-service' }),
    OutboxModule.forRoot({ db: DB }),
    InboxModule.forRoot({ db: DB }),
  ],
  controllers: [ReservationController],
  providers: [ReservationService, EventClient],
})
export class ReservationModule {}
