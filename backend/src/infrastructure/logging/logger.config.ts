import { LoggerModule } from 'nestjs-pino';

export const loggerModule = LoggerModule.forRoot({
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

    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'password',
        'passwordHash',
        'newPassword',
        'resetToken',
        'accessToken',
        'refreshToken',
        'otp',
        'token',
        'secret',
        'apiKey',
      ],
      censor: '[REDACTED]',
    },

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
});
