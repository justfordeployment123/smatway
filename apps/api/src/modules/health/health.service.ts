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
        postgres: boolean;
        redis: boolean;
        timestamp: string;
    }> {
        const [postgres, redis] = await Promise.all([
            this.checkPostgres(),
            this.checkRedis(),
        ]);

        const status = postgres && redis ? 'ok' : 'degraded';

        return {
            status,
            postgres,
            redis,
            timestamp: new Date().toISOString(),
        };
    }

    private async checkPostgres(): Promise<boolean> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }

    private async checkRedis(): Promise<boolean> {
        try {
            await this.redisService.ping();
            return true;
        } catch {
            return false;
        }
    }
}
