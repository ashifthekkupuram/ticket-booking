import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: [
    './apps/payment/src/db/schema.ts',
    './libs/outbox/src/outbox.schema.ts',
    './libs/inbox/src/inbox.schema.ts',
  ],
  out: './apps/payment/drizzle',
  dbCredentials: { url: process.env.PAYMENT_DATABASE_URL! },
});
