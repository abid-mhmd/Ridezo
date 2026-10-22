import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtAuthGuard } from '../../../modules/auth/presentation/guards/jwt-auth.guard.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
            '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
  ],
  providers: [JwtAuthGuard],
  exports: [JwtModule, JwtAuthGuard],
})
export class SecurityModule {}
