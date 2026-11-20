import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // Schema location
  schema: 'prisma/schema.prisma',

  // Migrations output path
  migrations: {
    path: 'prisma/migrations',
  },

  // Database URL for Prisma CLI (migrations, push, etc.)
  datasource: {
    url: env('DATABASE_URL'),
  },
});
