import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { EventModule } from './event.module.js';

async function bootstrap() {
  const app = await NestFactory.create(EventModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableShutdownHooks();
  await app.listen(process.env.EVENT_PORT ?? 3002);
}
await bootstrap();
