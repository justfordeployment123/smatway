import { Global, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';

@Global()
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType | null = null;

    async onModuleInit(): Promise<void> {
        this.client = createClient({
            url: process.env.REDIS_URL,
        });

        this.client.on('error', (error) => {
            console.error('Redis client error', error);
        });

        await this.client.connect();
    }

    async onModuleDestroy(): Promise<void> {
        if (this.client) {
            await this.client.quit();
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
        return this.getClient().ping();
    }
}
