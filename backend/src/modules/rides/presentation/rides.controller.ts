import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Req,
  Inject,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import type { AccessTokenPayload } from '../../auth/presentation/guards/jwt-auth.guard';
import type { ApiResponse } from '../../../common/interfaces/api-responce.interface';
import { ApiResponseHelper } from '../../../common/helpers/api-response.helper';
import { API_MESSAGES } from '../../../common/constants/message.constants';
import { RIDE_ENDPOINTS } from './constants/ride-endpoints.constants';
import { RIDE_MESSAGES } from './constants/ride-messages.constats';
import { RideMapper } from './mappers/ride.mapper';
import type { RideResponseDto } from './dto/ride-response.dto';
import { CreateRideDto } from '../application/dto/create-ride.dto';
import { UpdateRideDto } from '../application/dto/update-ride.dto';
import { GetMyRidesQueryDto } from '../application/dto/get-my-rides-query.dto';
import {
  CREATE_RIDE_USE_CASE,
  ICreateRideUseCase,
} from '../application/interfaces/create-ride.use-case.interface';
import {
  GET_MY_RIDES_USE_CASE,
  IGetMyRidesUseCase,
} from '../application/interfaces/get-my-rides.use-case.interface';
import {
  GET_RIDE_DETAILS_USE_CASE,
  IGetRideDetailsUseCase,
} from '../application/interfaces/get-ride-details.use-case';
import {
  UPDATE_RIDE_USE_CASE,
  IUpdateRideUseCase,
} from '../application/interfaces/update-ride.use-case.interface';
import {
  CANCEL_RIDE_USE_CASE,
  ICancelRideUseCase,
} from '../application/interfaces/cancel-ride.use-case';
import {
  DriverNotFoundError,
  DriverAccountInactiveError,
  DriverIdentityNotVerifiedError,
  VehicleNotFoundError,
  VehicleInactiveError,
  VehicleNotApprovedError,
  InvalidPassengerSeatCountError,
  InvalidDepartureTimeError as CreateInvalidDepartureTimeError,
  InvalidRideLocationsError as CreateInvalidRideLocationsError,
} from '../application/use-cases/create-ride.use-case';
import { RideNotFoundError as GetRideNotFoundError } from '../application/use-cases/get-ride-details.use-case';
import {
  RideNotFoundError as UpdateRideNotFoundError,
  RideCannotBeUpdatedError,
  InvalidDepartureTimeError as UpdateInvalidDepartureTimeError,
  InvalidRideLocationsError as UpdateInvalidRideLocationsError,
} from '../application/use-cases/update-ride.use-case';
import {
  RideNotFoundOrNotOwnedError,
  RideCannotBeCancelledError,
} from '../application/use-cases/cancel-ride.use-case';
import { SearchRidesDto } from '../application/dto/search-rides.dto';
import {
  SEARCH_RIDES_USE_CASE,
  ISearchRidesUseCase,
} from '../application/interfaces/search-rides.use-case.interface';
import { InvalidRideSearchError } from '../application/use-cases/search-rides.use-case';

@Controller()
@UseGuards(JwtAuthGuard)
export class RidesController {
  constructor(
    @Inject(CREATE_RIDE_USE_CASE)
    private readonly _createRideUseCase: ICreateRideUseCase,

    @Inject(GET_MY_RIDES_USE_CASE)
    private readonly _getMyRidesUseCase: IGetMyRidesUseCase,

    @Inject(GET_RIDE_DETAILS_USE_CASE)
    private readonly _getRideDetailsUseCase: IGetRideDetailsUseCase,

    @Inject(UPDATE_RIDE_USE_CASE)
    private readonly _updateRideUseCase: IUpdateRideUseCase,

    @Inject(CANCEL_RIDE_USE_CASE)
    private readonly _cancelRideUseCase: ICancelRideUseCase,

    @Inject(SEARCH_RIDES_USE_CASE)
    private readonly _searchRidesUseCase: ISearchRidesUseCase,
  ) {}

  @Post(RIDE_ENDPOINTS.ROOT)
  async createRide(
    @Req() request: Request & { user?: AccessTokenPayload },
    @Body() dto: CreateRideDto,
  ): Promise<ApiResponse<RideResponseDto>> {
    if (!request.user) {
      throw new UnauthorizedException(
        API_MESSAGES.AUTH.AUTHENTICATION_REQUIRED,
      );
    }

    try {
      const ride = await this._createRideUseCase.execute(request.user.sub, dto);

      return ApiResponseHelper.success(
        RideMapper.toResponse(ride),
        RIDE_MESSAGES.CREATED,
      );
    } catch (error) {
      this._handleCreateRideError(error);
      throw error;
    }
  }

  @Get(RIDE_ENDPOINTS.MY_RIDES)
  async getMyRides(
    @Req() request: Request & { user: AccessTokenPayload },
    @Query() query: GetMyRidesQueryDto,
  ): Promise<
    ApiResponse<{
      rides: RideResponseDto[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>
  > {
    const result = await this._getMyRidesUseCase.execute(request.user.sub, {
      page: query.page,
      limit: query.limit,
    });

    return ApiResponseHelper.success(
      {
        rides: RideMapper.toResponseList(result.rides),
        total: result.total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(result.total / query.limit),
      },
      RIDE_MESSAGES.LIST_RETRIEVED,
    );
  }

  @Get(RIDE_ENDPOINTS.SEARCH)
  async searchRides(
    @Req() request: Request & { user: AccessTokenPayload },
    @Query() query: SearchRidesDto,
  ): Promise<
    ApiResponse<{
      rides: RideResponseDto[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>
  > {
    try {
      const result = await this._searchRidesUseCase.execute(
        request.user.sub,
        query,
      );

      return ApiResponseHelper.success(
        {
          rides: RideMapper.toResponseList(result.rides),
          total: result.total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(result.total / query.limit),
        },
        RIDE_MESSAGES.LIST_RETRIEVED,
      );
    } catch (error) {
      if (error instanceof InvalidRideSearchError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Get(RIDE_ENDPOINTS.BY_ID)
  async getRideDetails(
    @Param('rideId') rideId: string,
  ): Promise<ApiResponse<RideResponseDto>> {
    try {
      const ride = await this._getRideDetailsUseCase.execute(rideId);

      return ApiResponseHelper.success(
        RideMapper.toResponse(ride),
        RIDE_MESSAGES.RETRIEVED,
      );
    } catch (error) {
      if (error instanceof GetRideNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  // Update ride
  @Patch(RIDE_ENDPOINTS.BY_ID)
  async updateRide(
    @Param('rideId') rideId: string,
    @Req() request: Request & { user: AccessTokenPayload },
    @Body() dto: UpdateRideDto,
  ): Promise<ApiResponse<RideResponseDto>> {
    try {
      const ride = await this._updateRideUseCase.execute(
        request.user.sub,
        rideId,
        dto,
      );

      return ApiResponseHelper.success(
        RideMapper.toResponse(ride),
        RIDE_MESSAGES.UPDATED,
      );
    } catch (error) {
      if (error instanceof UpdateRideNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof RideCannotBeUpdatedError) {
        throw new ConflictException(error.message);
      }

      if (
        error instanceof UpdateInvalidDepartureTimeError ||
        error instanceof UpdateInvalidRideLocationsError
      ) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  // Cancel ride
  @Patch(RIDE_ENDPOINTS.CANCEL)
  async cancelRide(
    @Param('rideId') rideId: string,
    @Req() request: Request & { user: AccessTokenPayload },
  ): Promise<ApiResponse<null>> {
    try {
      await this._cancelRideUseCase.execute(request.user.sub, rideId);

      return ApiResponseHelper.success(null, RIDE_MESSAGES.CANCELLED);
    } catch (error) {
      if (error instanceof RideNotFoundOrNotOwnedError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof RideCannotBeCancelledError) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  private _handleCreateRideError(error: unknown): void {
    if (error instanceof DriverNotFoundError) {
      throw new NotFoundException(error.message);
    }

    if (error instanceof VehicleNotFoundError) {
      throw new NotFoundException(error.message);
    }

    if (
      error instanceof DriverAccountInactiveError ||
      error instanceof DriverIdentityNotVerifiedError ||
      error instanceof VehicleInactiveError ||
      error instanceof VehicleNotApprovedError
    ) {
      throw new ForbiddenException(error.message);
    }

    if (
      error instanceof InvalidPassengerSeatCountError ||
      error instanceof CreateInvalidDepartureTimeError ||
      error instanceof CreateInvalidRideLocationsError
    ) {
      throw new BadRequestException(error.message);
    }
  }
}
