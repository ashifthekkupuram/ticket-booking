import { Controller, Get, Query } from '@nestjs/common';

import { EventService } from './event.service.js';
import { GetEventsQueryDto } from './dto/get-events-query-dto.js';

@Controller()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('events')
  getEvents(@Query() q: GetEventsQueryDto) {
    return this.eventService.getEvents(q.page, q.search);
  }

}
