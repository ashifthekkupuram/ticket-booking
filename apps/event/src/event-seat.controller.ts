import { Controller, Get, Query } from '@nestjs/common';

import { EventService } from './event.service.js';
import { GetEventSeatPriceQueryDto } from './dto/get-event-seats-prices-query.dto.js';

@Controller('event-seats')
export class EventSeatController {
  constructor(private readonly eventService: EventService) {}

  @Get('prices')
  getEventSeatsPrices(@Query() q: GetEventSeatPriceQueryDto) {
    return this.eventService.getEventSeatsPrices(q.ids);
  }
}
