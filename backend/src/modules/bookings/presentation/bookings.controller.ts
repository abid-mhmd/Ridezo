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
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import type { AccessTokenPayload } from '../../auth/presentation/guards/jwt-auth.guard';
import type { ApiResponse } from '../../../common/interfaces/api-responce.interface';
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
import {
  RideNotFoundError,
  CannotBookOwnRideError,
  RideNotAvailableError,
  InsufficientSeatsError,
  DuplicateBookingError,
} from '../application/use-cases/create-booking.use-case';
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
import { RESPOND_TO_BOOKING_REQUEST_USE_CASE } from '../application/interfaces/respond-to-booking-request.use-case.interface';
import { RespondToBookingRequestUseCase } from '../application/use-cases/respond-to-booking-request.use-case';
import { RespondBookingRequestDto } from '../application/dto/respond-booking-request.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    @Inject(CREATE_BOOKING_USE_CASE)
    private readonly createBookingUseCase: ICreateBookingUseCase,

    @Inject(GET_BOOKINGS_FOR_USER_USE_CASE)
    private readonly getBookingsForUserUseCase: IGetBookingsForUserUseCase,

    @Inject(GET_BOOKING_BY_ID_USE_CASE)
    private readonly getBookingByIdUseCase: IGetBookingByIdUseCase,

    @Inject(CANCEL_BOOKING_USE_CASE)
    private readonly cancelBookingUseCase: ICancelBookingUseCase,

    @Inject(RESPOND_TO_BOOKING_REQUEST_USE_CASE)
    private readonly respondToBookingRequestUseCase: RespondToBookingRequestUseCase,
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

    try {
      const booking = await this.createBookingUseCase.execute(
        request.user.sub,
        dto,
      );

      return {
        success: true,
        message: BOOKING_MESSAGES.CREATED,
        data: BookingMapper.toResponse(booking),
      };
    } catch (error) {
      this.handleCreateBookingError(error);
      throw error;
    }
  }

  @Get(BOOKING_ENDPOINTS.MY_BOOKINGS)
  async getMyBookings(
    @Req() request: Request & { user: AccessTokenPayload },
    @Query() query: GetMyBookingsQueryDto,
  ): Promise<
    ApiResponse<{
      bookings: BookingResponseDto[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>
  > {
    const result = await this.getBookingsForUserUseCase.execute(
      request.user.sub,
      {
        page: query.page,
        limit: query.limit,
      },
      'passenger',
    );

    return {
      success: true,
      message: BOOKING_MESSAGES.LIST_RETRIEVED,
      data: {
        bookings: BookingMapper.toResponseList(result.bookings),
        total: result.total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  }

  @Get(BOOKING_ENDPOINTS.BOOKING_REQUESTS)
  async getDriverBookingRequests(
    @Req() request: Request & { user: AccessTokenPayload },
    @Query() query: GetMyBookingsQueryDto,
  ): Promise<
    ApiResponse<{
      bookings: BookingResponseDto[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>
  > {
    const result = await this.getBookingsForUserUseCase.execute(
      request.user.sub,
      {
        page: query.page,
        limit: query.limit,
      },
      'driver',
    );

    return {
      success: true,
      message: BOOKING_MESSAGES.LIST_RETRIEVED,
      data: {
        bookings: BookingMapper.toResponseList(result.bookings),
        total: result.total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  }

  @Get(BOOKING_ENDPOINTS.BY_ID)
  async getBookingById(
    @Req() request: Request & { user: AccessTokenPayload },
    @Param('bookingId') bookingId: string,
  ): Promise<ApiResponse<BookingResponseDto>> {
    const booking = await this.getBookingByIdUseCase.execute(
      bookingId,
      request.user.sub,
    );

    return {
      success: true,
      message: BOOKING_MESSAGES.RETRIEVED,
      data: BookingMapper.toResponse(booking),
    };
  }

  @Patch(BOOKING_ENDPOINTS.CANCEL)
  async cancelBooking(
    @Req() request: Request & { user: AccessTokenPayload },
    @Param('bookingId') bookingId: string,
  ): Promise<ApiResponse<BookingResponseDto>> {
    const booking = await this.cancelBookingUseCase.execute(
      bookingId,
      request.user.sub,
    );

    return {
      success: true,
      message: BOOKING_MESSAGES.CANCELLED,
      data: BookingMapper.toResponse(booking),
    };
  }

  @Patch(BOOKING_ENDPOINTS.RESPOND)
  async respondToBookingRequest(
    @Req() request: Request & { user: AccessTokenPayload },
    @Param('bookingId') bookingId: string,
    @Body() dto: RespondBookingRequestDto,
  ): Promise<ApiResponse<BookingResponseDto>> {
    const booking = await this.respondToBookingRequestUseCase.execute(
      bookingId,
      request.user.sub,
      dto,
    );

    return {
      success: true,
      message: BOOKING_MESSAGES.RESPONDED,
      data: BookingMapper.toResponse(booking),
    };
  }

  private handleCreateBookingError(error: unknown): void {
    if (error instanceof RideNotFoundError) {
      throw new NotFoundException(error.message);
    }

    if (error instanceof CannotBookOwnRideError) {
      throw new BadRequestException(error.message);
    }

    if (
      error instanceof RideNotAvailableError ||
      error instanceof InsufficientSeatsError ||
      error instanceof DuplicateBookingError
    ) {
      throw new ConflictException(error.message);
    }
  }
}
