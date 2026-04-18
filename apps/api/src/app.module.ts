import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from './modules/cache/cache.module';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [DatabaseModule, CacheModule, HealthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
  ],
})
export class AppModule { }
