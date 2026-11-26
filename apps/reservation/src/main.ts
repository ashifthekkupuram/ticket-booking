import { NestFactory } from '@nestjs/core';
import { ReservationModule } from './reservation.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ReservationModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableShutdownHooks();
  await app.listen(process.env.RESERVATION_PORT ?? 3003);
}
await bootstrap();
