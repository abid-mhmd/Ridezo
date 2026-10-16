import { Injectable } from '@nestjs/common';

import type { OtpStorage } from '../../../../application/ports/otp-storage.js';
import { RedisService } from '../../../../../../infrastructure/redis/redis.service.js';

@Injectable()
export class RedisOtpStorage implements OtpStorage {
  constructor(private readonly redisService: RedisService) {}

  async save(email: string, otp: string, ttlSeconds: number): Promise<void> {
    await this.redisService.set(this.getKey(email), otp, ttlSeconds);
  }

  async find(email: string): Promise<string | null> {
    return this.redisService.get(this.getKey(email));
  }

  async delete(email: string): Promise<void> {
    await this.redisService.delete(this.getKey(email));
  }

  private getKey(email: string): string {
    return `auth:email-otp:${email.trim().toLowerCase()}`;
  }
}
