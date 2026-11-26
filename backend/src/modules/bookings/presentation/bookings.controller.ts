import {
  Body,
  Controller,
  Post,
  Req,
  Inject,
  Get,
  Query,
  Patch,
  Param,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import type { AccessTokenPayload } from '../../auth/presentation/guards/jwt-auth.guard';
import type { ApiResponse } from '../../../common/interfaces/api-responce.interface';
import { ApiResponseHelper } from '../../../common/helpers/api-response.helper';
import { API_MESSAGES } from '../../../common/constants/message.constants';
import { BOOKING_ENDPOINTS } from './constants/booking-endpoint.constants';
import { BOOKING_MESSAGES } from './constants/booking-messages.constants';
import { CreateBookingDto } from '../application/dto/create-booking.dto';
import {
  CREATE_BOOKING_USE_CASE,
  ICreateBookingUseCase,
} from '../application/interfaces/create-booking.use-case.inteface';
import { BookingMapper } from './mapper/booking.mapper';
import type { BookingResponseDto } from './dto/booking.respose.dto';
import { GetMyBookingsQueryDto } from '../application/dto/get-my-bookings-query.dto';
import {
  GET_BOOKINGS_FOR_USER_USE_CASE,
  IGetBookingsForUserUseCase,
} from '../application/interfaces/get-my-bookings-for-user.use-case.interface';
import {
  GET_BOOKING_BY_ID_USE_CASE,
  IGetBookingByIdUseCase,
} from '../application/interfaces/get-booking-by-id.use-case.interface';
import {
  CANCEL_BOOKING_USE_CASE,
  ICancelBookingUseCase,
} from '../application/interfaces/cancel-booking.use-case.interface';
import {
  RESPOND_TO_BOOKING_REQUEST_USE_CASE,
  type IRespondToBookingRequestUseCase,
} from '../application/interfaces/respond-to-booking-request.use-case.interface';
import { RespondBookingRequestDto } from '../application/dto/respond-booking-request.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    @Inject(CREATE_BOOKING_USE_CASE)
    private readonly _createBookingUseCase: ICreateBookingUseCase,

    @Inject(GET_BOOKINGS_FOR_USER_USE_CASE)
    private readonly _getBookingsForUserUseCase: IGetBookingsForUserUseCase,

    @Inject(GET_BOOKING_BY_ID_USE_CASE)
    private readonly _getBookingByIdUseCase: IGetBookingByIdUseCase,

    @Inject(CANCEL_BOOKING_USE_CASE)
    private readonly _cancelBookingUseCase: ICancelBookingUseCase,

    @Inject(RESPOND_TO_BOOKING_REQUEST_USE_CASE)
    private readonly _respondToBookingRequestUseCase: IRespondToBookingRequestUseCase,
  ) {}

  @Post(BOOKING_ENDPOINTS.ROOT)
  async createBooking(
    @Req() request: Request & { user?: AccessTokenPayload },
    @Body() dto: CreateBookingDto,
  ): Promise<ApiResponse<BookingResponseDto>> {
    if (!request.user) {
      throw new UnauthorizedException(
        API_MESSAGES.AUTH.AUTHENTICATION_REQUIRED,
      );
    }

    const booking = await this._createBookingUseCase.execute(
      request.user.sub,
      dto,
    );

    return ApiResponseHelper.success(
      BookingMapper.toResponse(booking),
      BOOKING_MESSAGES.CREATED,
    );
  }

  @Get(BOOKING_ENDPOINTS.MY_BOOKINGS)
  async getMyBookings(
    @Req() request: Request & { user: AccessTokenPayload },
    @Query() query: GetMyBookingsQueryDto,
  ): Promise<ApiResponse<BookingResponseDto[]>> {
    const result = await this._getBookingsForUserUseCase.execute(
      request.user.sub,
      {
        page: query.page,
        limit: query.limit,
      },
      'passenger',
    );

    return ApiResponseHelper.paginated(
      BookingMapper.toResponseList(result.bookings),
      {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
      BOOKING_MESSAGES.LIST_RETRIEVED,
    );
  }

  @Get(BOOKING_ENDPOINTS.BOOKING_REQUESTS)
  async getDriverBookingRequests(
    @Req() request: Request & { user: AccessTokenPayload },
    @Query() query: GetMyBookingsQueryDto,
  ): Promise<ApiResponse<BookingResponseDto[]>> {
    const result = await this._getBookingsForUserUseCase.execute(
      request.user.sub,
      {
        page: query.page,
        limit: query.limit,
      },
      'driver',
    );

    return ApiResponseHelper.paginated(
      BookingMapper.toResponseList(result.bookings),
      {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
      BOOKING_MESSAGES.LIST_RETRIEVED,
    );
  }

  @Get(BOOKING_ENDPOINTS.BY_ID)
  async getBookingById(
    @Req() request: Request & { user: AccessTokenPayload },
    @Param('bookingId') bookingId: string,
  ): Promise<ApiResponse<BookingResponseDto>> {
    const booking = await this._getBookingByIdUseCase.execute(
      bookingId,
      request.user.sub,
    );

    return ApiResponseHelper.success(
      BookingMapper.toResponse(booking),
      BOOKING_MESSAGES.RETRIEVED,
    );
  }

  @Patch(BOOKING_ENDPOINTS.CANCEL)
  async cancelBooking(
    @Req() request: Request & { user: AccessTokenPayload },
    @Param('bookingId') bookingId: string,
  ): Promise<ApiResponse<BookingResponseDto>> {
    const booking = await this._cancelBookingUseCase.execute(
      bookingId,
      request.user.sub,
    );

    return ApiResponseHelper.success(
      BookingMapper.toResponse(booking),
      BOOKING_MESSAGES.CANCELLED,
    );
  }

  @Patch(BOOKING_ENDPOINTS.RESPOND)
  async respondToBookingRequest(
    @Req() request: Request & { user: AccessTokenPayload },
    @Param('bookingId') bookingId: string,
    @Body() dto: RespondBookingRequestDto,
  ): Promise<ApiResponse<BookingResponseDto>> {
    const booking = await this._respondToBookingRequestUseCase.execute(
      bookingId,
      request.user.sub,
      dto,
    );

    return ApiResponseHelper.success(
      BookingMapper.toResponse(booking),
      BOOKING_MESSAGES.RESPONDED,
    );
  }
}
