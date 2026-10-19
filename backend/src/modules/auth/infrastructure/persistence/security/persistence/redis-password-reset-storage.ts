import { Injectable } from '@nestjs/common';
import type { PasswordResetStorage } from '../../../../application/ports/password-reset-storage.js';
import { RedisService } from '../../../../../../infrastructure/redis/redis.service.js';

@Injectable()
export class RedisPasswordResetStorage implements PasswordResetStorage {
  constructor(private readonly redisService: RedisService) {}

  async save(
    tokenHash: string,
    userId: string,
    ttlSeconds: number,
  ): Promise<void> {
    await this.redisService.set(this.tokenKey(tokenHash), userId, ttlSeconds);
  }

  async consume(tokenHash: string): Promise<string | null> {
    return this.redisService.getAndDelete(this.tokenKey(tokenHash));
  }

  async acquireCooldown(email: string, ttlSecond: number): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();
    return this.redisService.setIfNotExists(
      this.cooldownKey(normalizedEmail),
      '1',
      ttlSecond,
    );
  }

  async releaseCooldown(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();

    await this.redisService.delete(this.cooldownKey(normalizedEmail));
  }

  private tokenKey(tokenHash: string): string {
    return `auth:password-reset:token:${tokenHash}`;
  }

  private cooldownKey(email: string): string {
    return `auth:password-reset:cooldown:${email}`;
  }
}
