import type {
  ApiResponse,
  PaginationMeta,
} from '../interfaces/api-responce.interface';

export class ApiResponseHelper {
  static success<T>(data: T, message = 'Success'): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  static paginated<T>(
    data: T[],
    meta: PaginationMeta,
    message = 'Success',
  ): ApiResponse<T[]> {
    return {
      success: true,
      message,
      data,
      meta,
    };
  }

  static error(message: string, statusCode: number): ApiResponse<null> {
    return {
      success: false,
      message,
      data: null,
      statusCode,
    };
  }
}
