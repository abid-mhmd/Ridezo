import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TOKEN_SERVICE } from '../../../modules/auth/application/ports/token.service';
import { JwtTokenService } from '../../security/jwt-token.service';

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
  providers: [
    JwtTokenService,
    {
      provide: TOKEN_SERVICE,
      useExisting: JwtTokenService,
    },
  ],
  exports: [JwtModule, TOKEN_SERVICE],
})
export class SecurityModule {}
