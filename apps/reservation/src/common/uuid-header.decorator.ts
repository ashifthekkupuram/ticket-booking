import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const UuidHeader = createParamDecorator(
  (name: string, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<Request>().headers[name.toLowerCase()],
);
