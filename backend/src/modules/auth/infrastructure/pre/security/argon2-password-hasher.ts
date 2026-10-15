import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';

import type { PasswordHasher } from '../../../application/ports/passwordhasher.js';

@Injectable()
export class Argon2PasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2d,
    });
  }
}
