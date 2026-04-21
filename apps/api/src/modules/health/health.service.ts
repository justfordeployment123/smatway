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
        postgresError?: string;
        redisError?: string;
        databaseUrlConfigured: boolean;
        redisUrlConfigured: boolean;
        timestamp: string;
    }> {
        const [postgresCheck, redisCheck] = await Promise.all([
            this.checkPostgres(),
            this.checkRedis(),
        ]);

        const postgres = postgresCheck.ok;
        const redis = redisCheck.ok;
        const status = postgres && redis ? 'ok' : 'degraded';

        return {
            status,
            postgres,
            redis,
            postgresError: postgresCheck.error,
            redisError: redisCheck.error,
            databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
            redisUrlConfigured: Boolean(process.env.REDIS_URL),
            timestamp: new Date().toISOString(),
        };
    }

    private async checkPostgres(): Promise<{ ok: boolean; error?: string }> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return { ok: true };
        } catch (error) {
            return {
                ok: false,
                error: this.sanitizeError(error),
            };
        }
    }

    private async checkRedis(): Promise<{ ok: boolean; error?: string }> {
        try {
            await this.redisService.ping();
            return { ok: true };
        } catch (error) {
            return {
                ok: false,
                error: this.sanitizeError(error),
            };
        }
    }

    private sanitizeError(error: unknown): string {
        if (error instanceof Error && error.message) {
            return error.message.replace(/(postgres(?:ql)?:\/\/)[^\s@]+@/gi, '$1***:***@');
        }

        return 'Unknown error';
    }
}
