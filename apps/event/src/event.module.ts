import { Module } from '@nestjs/common';
import { EventController } from './event.controller.js';
import { EventService } from './event.service.js';
import { ConfigModule } from '@nestjs/config';
import { DB, DbModule } from './db/db.module.js';
import { EventSeatController } from './event-seat.controller.js';
import { KafkaModule } from '@app/kafka';
import { InboxModule } from '@app/inbox';
import { EventConsumerService } from './event.consumer.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DbModule, KafkaModule.forRoot({ clientId: 'event-service' }), InboxModule.forRoot({ db: DB })],
  controllers: [EventController, EventSeatController],
  providers: [EventService, EventConsumerService],
})
export class EventModule { }
