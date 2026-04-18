import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class HealthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
    ) { }

    async getStatus(): Promise<{
        status: 'ok' | 'degraded';
        postgres: 'up' | 'down';
        redis: 'up' | 'down';
        timestamp: string;
    }> {
        const [postgres, redis] = await Promise.all([
            this.checkPostgres(),
            this.checkRedis(),
        ]);

        const status = postgres === 'up' && redis === 'up' ? 'ok' : 'degraded';

        return {
            status,
            postgres,
            redis,
            timestamp: new Date().toISOString(),
        };
    }

    private async checkPostgres(): Promise<'up' | 'down'> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return 'up';
        } catch {
            return 'down';
        }
    }

    private async checkRedis(): Promise<'up' | 'down'> {
        try {
            await this.redisService.ping();
            return 'up';
        } catch {
            return 'down';
        }
    }
}
