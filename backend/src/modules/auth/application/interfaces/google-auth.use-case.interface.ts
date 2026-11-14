import type { UserEntity } from '../../../users/domain/entities/user.entity';
import type { GoogleProfile } from '../use-cases/google-auth.use-case';

export interface GoogleAuthResult {
  accessToken: string;
  refreshToken: string;
  refreshTtl: number;
  user: UserEntity;
}

export interface IGoogleAuthUseCase {
  execute(profile: GoogleProfile): Promise<GoogleAuthResult>;
}

export const GOOGLE_AUTH_USE_CASE = Symbol('GOOGLE_AUTH_USE_CASE');
