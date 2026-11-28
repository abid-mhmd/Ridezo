import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Money } from '../../../../common/domain/value-objects/money.vo';
import {
  VEHICLE_REPOSITORY,
  type IVehicleRepository,
} from '../../../vehicles/domain/repositories/vehicle.repository';
import { RECURRING_RIDE_CONSTANTS } from '../../domain/constants/recurring-ride.constants';
import { RecurringRideStatus } from '../../domain/enums/recurring-ride.enums';
import {
  RECURRING_RIDE_REPOSITORY,
  type IRecurringRideRepository,
} from '../../domain/repositories/recurring-ride.repository';
import type { CreateRecurringRideDto } from '../dto/create-recurring-ride.dto';
import type { ICreateRecurringRideUseCase } from '../interfaces/create-recurrng-ride.use-case.interface';
import {
  GENERATE_UPCOMING_RIDES_USE_CASE,
  type IGenerateUpcomingRidesUseCase,
} from '../interfaces/generate-upcoming-rides.use-case.interface';
import { RecurringRideEntity } from '../../domain/entities/recurring-ride.entity';

@Injectable()
export class CreateRecurringRideUseCase implements ICreateRecurringRideUseCase {
  constructor(
    @Inject(RECURRING_RIDE_REPOSITORY)
    private readonly _recurringRideRepository: IRecurringRideRepository,
    @Inject(VEHICLE_REPOSITORY)
    private readonly _vehicleRepository: IVehicleRepository,
    @Inject(GENERATE_UPCOMING_RIDES_USE_CASE)
    private readonly _generateUpcomingRidesUseCase: IGenerateUpcomingRidesUseCase,
  ) {}

  async execute(
    driverId: string,
    dto: CreateRecurringRideDto,
  ): Promise<{ schedule: RecurringRideEntity; generatedCount: number }> {
    const vehicle = await this._vehicleRepository.findById(dto.vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Selected vehicle not found.');
    }
    if (vehicle.ownerId !== driverId) {
      throw new ForbiddenException('You do not own the selected vehicle.');
    }
    if (
      !vehicle.isActive ||
      String(vehicle.verificationStatus) !== 'approved'
    ) {
      throw new BadRequestException(
        'Only active and verified vehicles can be used for recurring rides.',
      );
    }

    const fare = Money.create(dto.pricePerSeat);
    const uniqueDays = [...new Set(dto.daysOfWeek)].sort((a, b) => a - b);
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const endDate = dto.endDate ? new Date(dto.endDate) : null;

    if (endDate && endDate < startDate) {
      throw new BadRequestException(
        'End date cannot be earlier than start date.',
      );
    }

    const schedule = await this._recurringRideRepository.create({
      driverId,
      vehicleId: dto.vehicleId,
      origin: dto.origin,
      destination: dto.destination,
      stops: dto.stops ?? [],
      daysOfWeek: uniqueDays,
      departureTime: dto.departureTime,
      timezone: RECURRING_RIDE_CONSTANTS.DEFAULT_TIMEZONE,
      startDate,
      endDate,
      totalSeats: dto.totalSeats,
      pricePerSeat: fare.getAmount(),
      preferences: dto.preferences ?? {},
      pickupInstructions: dto.pickupInstructions?.trim() ?? '',
      generateAheadDays:
        dto.generateAheadDays ??
        RECURRING_RIDE_CONSTANTS.DEFAULT_GENERATE_AHEAD_DAYS,
      lastGeneratedDate: null,
      status: RecurringRideStatus.ACTIVE,
    });
    const { ridesCreated } =
      await this._generateUpcomingRidesUseCase.generateForSchedule(schedule);

    return { schedule, generatedCount: ridesCreated };
  }
}
