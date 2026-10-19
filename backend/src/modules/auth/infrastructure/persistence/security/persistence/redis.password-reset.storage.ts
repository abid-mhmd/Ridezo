import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../../../../infrastructure/redis/redis.service.js';
import type { PasswordResetStorage } from '../../../../application/ports/password-reset-storage.js';

@Injectable()
export class RedisPasswordResetStorage implements PasswordResetStorage {
  constructor(private readonly redisService: RedisService) {}

  async save(
    email: string,
    otpHash: string,
    userId: string,
    ttlSeconds: number,
  ): Promise<void> {
    const value = JSON.stringify({ otpHash, userId });

    await this.redisService.set(this.getKey(email), value, ttlSeconds);
  }

  async find(
    email: string,
  ): Promise<{ otpHash: string; userId: string } | null> {
    const value = await this.redisService.get(this.getKey(email));

    if (!value) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(value);

      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        !('otpHash' in parsed) ||
        !('userId' in parsed) ||
        typeof parsed.otpHash !== 'string' ||
        typeof parsed.userId !== 'string'
      ) {
        return null;
      }

      return {
        otpHash: parsed.otpHash,
        userId: parsed.userId,
      };
    } catch {
      return null;
    }
  }

  async delete(email: string): Promise<void> {
    await this.redisService.delete(this.getKey(email));
  }

  async acquireCooldown(email: string, ttlSeconds: number): Promise<boolean> {
    return this.redisService.setIfNotExists(
      this.getCooldownKey(email),
      '1',
      ttlSeconds,
    );
  }

  async releaseCooldown(email: string): Promise<void> {
    await this.redisService.delete(this.getCooldownKey(email));
  }

  private getKey(email: string): string {
    return `auth:password-reset:${email.trim().toLowerCase()}`;
  }

  private getCooldownKey(email: string): string {
    return `${this.getKey(email)}:cooldown`;
  }
}
