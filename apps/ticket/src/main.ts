import { NestFactory } from '@nestjs/core';
import { TicketModule } from './ticket.module.js';

async function bootstrap() {
  const app = await NestFactory.create(TicketModule);
  await app.listen(process.env.TICKET_PORT ?? 3000);
}
await bootstrap();
