import { NestFactory } from '@nestjs/core';
import { PaymentModule } from './payment.module.js';

async function bootstrap() {
  const app = await NestFactory.create(PaymentModule);
  await app.listen(process.env.PAYMENT_PORT ?? 3000);
}
await bootstrap();
