import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const appEnvPath = resolve(__dirname, '..', '.env');
if (existsSync(appEnvPath)) {
  loadEnv({ path: appEnvPath });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
