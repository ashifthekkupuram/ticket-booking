import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './apps/event/src/db/schema.ts',
  out: './apps/event/drizzle',
  dbCredentials: { url: process.env.EVENT_DATABASE_URL! },
});