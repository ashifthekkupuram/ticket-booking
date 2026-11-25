import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Kafka, type Consumer } from 'kafkajs';

import { KAFKA_CLIENT } from './kafka.constants.js';
import type { AnyEnvelope, EventName } from '@app/contracts';

export type EnvelopeHandler = (envelope: AnyEnvelope) => Promise<void>;

@Injectable()
export class KafkaConsumerService implements OnApplicationShutdown {
  private readonly consumers: Consumer[] = [];
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(@Inject(KAFKA_CLIENT) private readonly kafka: Kafka) {}

  async subscribe(
    groupId: string,
    topics: EventName[],
    handler: EnvelopeHandler,
  ) {
    const consumer = this.kafka.consumer({ groupId });
    this.consumers.push(consumer);
    await consumer.connect();

    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: true });
    }

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;

        let envelope: AnyEnvelope;

        try {
          envelope = JSON.parse(message.value.toString()) as AnyEnvelope;
        } catch {
          this.logger.error(
            `Skipping malformed message ${topic}[${partition}]@${message.offset}`,
          );
          return;
        }

        await handler(envelope);
      },
    });
  }

  async onApplicationShutdown() {
    await Promise.all(this.consumers.map((c) => c.disconnect()));
  }
}
