import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { RedisModule } from './infrastructure/redis/redis.module.js';
import { AdminAuthModule } from './modules/admin/admin-auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),

        PORT: Joi.number().port().default(3000),
        MONGODB_URI: Joi.string().required(),
        REDIS_URL: Joi.string().uri().required(),
        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.number().port().required(),
        SMTP_USER: Joi.string().email().required(),
        SMTP_PASSWORD: Joi.string().required(),
        SMTP_FROM: Joi.string().required(),
        OTP_HASH_SECRET: Joi.string().min(64).required(),
        JWT_ACCESS_SECRET: Joi.string().min(64).required(),
        JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_TTL_SECONDS: Joi.number()
          .integer()
          .positive()
          .default(604800),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string().uri().required(),
        FRONTEND_URL: Joi.string().uri().required(),
        CLOUDINARY_CLOUD_NAME: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUDINARY_API_SECRET: Joi.string().required(),
      }),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'HH:MM:ss',
                  ignore: 'pid,hostname',
                  singleLine: true,
                },
              }
            : undefined,

        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
          'password',
          'passwordHash',
          'accessToken',
          'refreshToken',
        ],

        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
          }),

          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
      },
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    RedisModule,
    AdminAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
