import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiResponseHelper } from '../helpers/api-response.helper';
import { API_MESSAGES } from '../constants/message.constants';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly _logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = API_MESSAGES.COMMON.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null && 'message' in res) {
        const rawMessage = (res as { message: string | string[] }).message;
        message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;
      }
    } else if (exception instanceof Error) {
      this._logger.error(exception.message, exception.stack);
    }

    response
      .status(statusCode)
      .json(ApiResponseHelper.error(message, statusCode));
  }
}
