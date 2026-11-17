import { NestFactory } from '@nestjs/core';
import { ReservationModule } from './reservation.module.js';

async function bootstrap() {
  const app = await NestFactory.create(ReservationModule);
  await app.listen(process.env.port ?? 3000);
}
await bootstrap();
