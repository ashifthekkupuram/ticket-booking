import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, logLevel } from 'kafkajs';

import { KAFKA_CLIENT } from './kafka.constants.js';
import { KafkaProducerService } from './kafka-producer.service.js';
import { KafkaConsumerService } from './kafka-consumer.service.js';

@Module({})
export class KafkaModule {
  static forRoot(options: { clientId: string }): DynamicModule {
    return {
      module: KafkaModule,
      global: true,
      providers: [
        {
          provide: KAFKA_CLIENT,
          inject: [ConfigService],
          useFactory: (config: ConfigService) =>
            new Kafka({
              clientId: options.clientId,
              brokers: config.getOrThrow<string>('KAFKA_BROKERS').split(','),
              logLevel: logLevel.WARN,
            }),
        },
        KafkaProducerService,
        KafkaConsumerService,
      ],
      exports: [KAFKA_CLIENT, KafkaProducerService, KafkaConsumerService],
    };
  }
}
