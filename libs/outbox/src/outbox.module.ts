import { Module, DynamicModule, InjectionToken } from '@nestjs/common';

import { OutboxService } from './outbox.service.js';
import { OUTBOX_DB } from './outbox.constants.js';
import { OutboxRelayService } from './outbox-relay.service.js';

@Module({})
export class OutboxModule {
  static forRoot(options: { db: InjectionToken }): DynamicModule {
    return {
      module: OutboxModule,
      providers: [
        { provide: OUTBOX_DB, useExisting: options.db },
        OutboxService,
        OutboxRelayService,
      ],
      exports: [OutboxService],
    };
  }
}
