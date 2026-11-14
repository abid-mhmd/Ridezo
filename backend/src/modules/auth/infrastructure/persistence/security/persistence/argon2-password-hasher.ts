import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';

import type { IPasswordHasher } from '../../../../application/ports/passwordhasher';

@Injectable()
export class Argon2PasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2d,
    });
  }

  async verify(password: string, passwordHash: string): Promise<boolean> {
    try {
      return await argon2.verify(passwordHash, password);
    } catch {
      return false;
    }
  }
}
