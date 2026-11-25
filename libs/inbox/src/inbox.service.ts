import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { Envelope, EventName, EventPayloads } from '@app/contracts';
import { INBOX_DB } from './inbox.constants.js';
import { inboxEvent } from './inbox.schema.js';

export type InboxTx = Parameters<
  Parameters<NodePgDatabase<any>['transaction']>[0]
>[0];

@Injectable()
export class InboxService {
  constructor(@Inject(INBOX_DB) private readonly db: NodePgDatabase<any>) {}

  async handle<E extends EventName>(
    envelope: Envelope<E>,
    fn: (tx: InboxTx, payload: EventPayloads[E]) => Promise<void>,
  ): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const inserted = await tx
        .insert(inboxEvent)
        .values({
          eventId: envelope.event_id,
          eventType: envelope.event_type,
        })
        .onConflictDoNothing()
        .returning({ eventId: inboxEvent.eventId });

      if (inserted.length === 0) return false;

      await fn(tx, envelope.payload);
      return true;
    });
  }
}
