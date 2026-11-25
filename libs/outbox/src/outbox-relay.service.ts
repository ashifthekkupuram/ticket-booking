import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { KafkaProducerService } from '@app/kafka';
import { OUTBOX_DB, OUTBOX_EVENT_VERSION } from './outbox.constants.js';
import { outboxEvent } from './outbox.schema.js';
import { eq } from 'drizzle-orm';
import { AnyEnvelope } from '@app/contracts';

const BATCH_SIZE = 50;
const POLL_INTERVAL_MS = 1000;
const MAX_RETRIES = 10;

@Injectable()
export class OutboxRelayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayService.name);
  private running = false;
  private timer?: NodeJS.Timeout;
  private current: Promise<void> = Promise.resolve();

  constructor(
    @Inject(OUTBOX_DB) private readonly db: NodePgDatabase<any>,
    private readonly producer: KafkaProducerService,
  ) {}

  onModuleInit() {
    this.running = true;
    this.schedule(0);
  }

  async onModuleDestroy() {
    this.running = false;
    clearTimeout(this.timer);
    await this.current;
  }

  private schedule(delayMs: number) {
    if (!this.running) return;
    this.timer = setTimeout(() => {
      this.current = this.run();
    }, delayMs);
  }

  private async run() {
    let delay = POLL_INTERVAL_MS;
    try {
      const hasMore = await this.tick();
      if (hasMore) delay = 0;
    } catch (error) {
      this.logger.error(
        'Outbox relay tick failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
    this.schedule(delay);
  }

  private async tick(): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(outboxEvent)
        .where(eq(outboxEvent.status, 'PENDING'))
        .orderBy(outboxEvent.createdAt, outboxEvent.id)
        .limit(BATCH_SIZE)
        .for('update', { skipLocked: true });

      for (const row of rows) {
        try {
          const envelope = {
            event_id: row.id,
            event_type: row.eventType,
            version: OUTBOX_EVENT_VERSION,
            created_at: row.createdAt.toISOString(),
            correlation_id: row.correlationId,
            payload: row.payload,
          } as AnyEnvelope;

          await this.producer.publish(envelope, row.aggregateId);
        } catch (error) {
          const retryCount = row.retryCount + 1;
          const failed = retryCount >= MAX_RETRIES;

          await tx
            .update(outboxEvent)
            .set({ retryCount, status: failed ? 'FAILED' : 'PENDING' })
            .where(eq(outboxEvent.id, row.id));

          this.logger.error(
            `Publish failed for outbox ${row.id} (attempt ${retryCount})${failed ? ', marked FAILED' : ''}`,
            error instanceof Error ? error.stack : String(error),
          );
          return false;
        }

        await tx
          .update(outboxEvent)
          .set({ status: 'PUBLISHED', publishedAt: new Date() })
          .where(eq(outboxEvent.id, row.id));
      }
      return rows.length === BATCH_SIZE;
    });
  }
}
