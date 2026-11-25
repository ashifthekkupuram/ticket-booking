import { DynamicModule, InjectionToken, Module } from '@nestjs/common';

import { INBOX_DB } from './inbox.constants.js';
import { InboxService } from './inbox.service.js';

@Module({})
export class InboxModule {
  static forRoot(options: { db: InjectionToken }): DynamicModule {
    return {
      module: InboxModule,
      providers: [{ provide: INBOX_DB, useExisting: options.db }, InboxService],
      exports: [InboxService],
    };
  }
}
