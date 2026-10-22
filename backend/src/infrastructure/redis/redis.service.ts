import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy, OnModuleInit {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis(this.configService.getOrThrow<string>('REDIS_URL'), {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.redis.connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis.status === 'ready') {
      await this.redis.quit();
    } else {
      this.redis.disconnect();
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds !== undefined) {
      await this.redis.set(key, value, 'EX', ttlSeconds);
      return;
    }
    await this.redis.set(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async incrementWithExpiry(key: string, ttlSeconds: number): Promise<number> {
    const result = await this.redis.incr(key);

    if (result === 1) {
      await this.redis.expire(key, ttlSeconds);
    }

    return result;
  }

  async setIfNotExists(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    const result = await this.redis.set(key, value, 'EX', ttlSeconds, 'NX');

    return result === 'OK';
  }

  async getAndDelete(key: string): Promise<string | null> {
    return this.redis.getdel(key);
  }

  async rotateToken(
    currentKey: string,
    currentHash: string,
    newKey: string,
    newHash: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    const script = `
    local current = redis.call('GET', KEYS[1])

    if current ~= ARGV[1] then
      return 0
    end

    redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[3])
    redis.call('DEL', KEYS[1])

    return 1
  `;

    const result = await this.redis.eval(
      script,
      2,
      currentKey,
      newKey,
      currentHash,
      newHash,
      ttlSeconds,
    );

    return result === 1;
  }
}
