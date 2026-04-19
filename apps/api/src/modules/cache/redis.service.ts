import { Global, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';

@Global()
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType | null = null;
    private readonly logger = new Logger(RedisService.name);
    private hasLoggedConnectionError = false;

    async onModuleInit(): Promise<void> {
        if (!process.env.REDIS_URL) {
            this.logger.warn('REDIS_URL is not set. Redis checks will be reported as down.');
            return;
        }

        this.client = createClient({
            url: process.env.REDIS_URL,
            socket: {
                // Avoid continuous reconnect loops when redis is unavailable.
                reconnectStrategy: () => false,
            },
        });

        this.client.on('error', (error) => {
            if (!this.hasLoggedConnectionError) {
                this.hasLoggedConnectionError = true;
                this.logger.warn(
                    `Redis unavailable. Health checks will report redis=false. ${error instanceof Error ? error.message : ''}`,
                );
            }
        });

        try {
            await this.client.connect();
            this.hasLoggedConnectionError = false;
        } catch (error) {
            this.logger.warn(
                `Redis unavailable at startup. Health checks will report redis=false. ${error instanceof Error ? error.message : ''}`,
            );
            this.client = null;
        }
    }

    async onModuleDestroy(): Promise<void> {
        if (this.client) {
            try {
                await this.client.quit();
            } catch {
                // Ignore shutdown errors when redis is unavailable.
            }
            this.client = null;
        }
    }

    getClient(): RedisClientType {
        if (!this.client) {
            throw new Error('Redis client is not initialized');
        }

        return this.client;
    }

    async ping(): Promise<string> {
        if (!this.client) {
            throw new Error('Redis is unavailable');
        }

        return this.getClient().ping();
    }
}
