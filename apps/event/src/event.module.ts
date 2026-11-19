import { Module } from '@nestjs/common';
import { EventController } from './event.controller.js';
import { EventService } from './event.service.js';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DbModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
