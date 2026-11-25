import { Injectable } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { EventName, EventPayloads } from '@app/contracts';
import { outboxEvent } from './outbox.schema.js';

type OutboxInput<E extends EventName> = {
  event_type: E;
  payload: EventPayloads[E];
  correlation_id: string;
  aggregate_id: string;
  aggregate_type: string;
};

type Executor = Pick<NodePgDatabase<any>, 'insert'>;

@Injectable()
export class OutboxService {
  async add<E extends EventName>(tx: Executor, input: OutboxInput<E>) {
    const [outbox] = await tx
      .insert(outboxEvent)
      .values({
        aggregateId: input.aggregate_id,
        aggregateType: input.aggregate_type,
        correlationId: input.correlation_id,
        eventType: input.event_type,
        payload: input.payload,
      })
      .returning({ id: outboxEvent.id });

    return outbox.id;
  }
}
