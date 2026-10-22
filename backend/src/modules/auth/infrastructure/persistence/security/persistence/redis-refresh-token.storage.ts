import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../../../../infrastructure/redis/redis.service.js';
import type { RefreshTokenStorage } from '../../../../application/ports/refresh-token-storage.js';

@Injectable()
export class RedisRefreshTokenStorage implements RefreshTokenStorage {
  constructor(private readonly redisService: RedisService) {}

  async store(
    sessionId: string,
    tokenHash: string,
    ttlSeconds: number,
  ): Promise<void> {
    await this.redisService.set(
      this.getKey(sessionId),
      tokenHash,
      ttlSeconds,
    );
  }

  async get(sessionId: string): Promise<string | null> {
    return this.redisService.get(this.getKey(sessionId));
  }

  async delete(sessionId: string): Promise<void> {
    await this.redisService.delete(this.getKey(sessionId));
  }

  async rotate(
    sessionId: string,
    currentHash: string,
    newSessionId: string,
    newHash: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    return this.redisService.rotateToken(
      this.getKey(sessionId),
      currentHash,
      this.getKey(newSessionId),
      newHash,
      ttlSeconds,
    );
  }

  private getKey(sessionId: string): string {
    return `auth:refresh-token:${sessionId}`;
  }
}