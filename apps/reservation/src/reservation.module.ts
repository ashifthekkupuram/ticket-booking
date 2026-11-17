import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller.js';
import { ReservationService } from './reservation.service.js';

@Module({
  imports: [],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
