import { Controller, Get } from '@nestjs/common';
import { TicketService } from './ticket.service.js';

@Controller()
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  getHello(): string {
    return this.ticketService.getHello();
  }
}
