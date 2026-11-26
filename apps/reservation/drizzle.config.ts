import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: [
    './apps/reservation/src/db/schema.ts',
    './libs/outbox/src/outbox.schema.ts',
    './libs/inbox/src/inbox.schema.ts',
  ],
  out: './apps/reservation/drizzle',
  dbCredentials: { url: process.env.RESERVATION_DATABASE_URL! },
});
