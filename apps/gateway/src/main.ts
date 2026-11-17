import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module.js';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  await app.listen(process.env.GATEWAY_PORT  ?? 3000);
}
await bootstrap();
