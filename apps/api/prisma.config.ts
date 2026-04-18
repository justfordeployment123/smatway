import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const databaseUrl =
    process.env.DATABASE_URL ??
    'postgresql://smataway:smataway@localhost:5432/smataway?schema=public';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: databaseUrl,
    },
});
