import {
  Inject,
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, type Producer } from 'kafkajs';

import { KAFKA_CLIENT } from './kafka.constants.js';
import { AnyEnvelope } from '@app/contracts';

@Injectable()
export class KafkaProducerService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly producer: Producer;

  constructor(@Inject(KAFKA_CLIENT) kafka: Kafka) {
    this.producer = kafka.producer({
      idempotent: true,
      maxInFlightRequests: 1,
    });
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onApplicationShutdown() {
    await this.producer.disconnect();
  }

  async publish(envelope: AnyEnvelope, key: string) {
    await this.producer.send({
      topic: envelope.event_type,
      acks: -1,
      messages: [{ key, value: JSON.stringify(envelope) }],
    });
  }
}
