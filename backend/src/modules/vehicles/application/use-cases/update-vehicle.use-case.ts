import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository.js';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository.js';
import type { UpdateVehicleDto } from '../dto/update-vehicle.dto.js';
import type { VehicleEntity } from '../../domain/entities/vehicle.entity.js';
import { VEHICLE_MESSAGES } from '../../presentation/constants/vehicle-messages.constants.js';
import { VehicleRegistrationAlreadyExistsError } from './add-vehicle.use-case.js';

@Injectable()
export class UpdateVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(
    vehicleId: string,
    ownerId: string,
    dto: UpdateVehicleDto,
  ): Promise<VehicleEntity> {
    const existingVehicle = await this.vehicleRepository.findByIdAndOwner(
      vehicleId,
      ownerId,
    );

    if (!existingVehicle) {
      throw new NotFoundException(VEHICLE_MESSAGES.NOT_FOUND);
    }

    if (dto.registrationNumber !== undefined) {
      const registrationNumber = dto.registrationNumber
        .replace(/[\s-]/g, '')
        .toUpperCase();

      const registrationExists =
        await this.vehicleRepository.existsByRegistrationNumber(
          registrationNumber,
          vehicleId,
        );

      if (registrationExists) {
        throw new VehicleRegistrationAlreadyExistsError();
      }

      dto = {
        ...dto,
        registrationNumber,
      };
    }

    const vehicle = await this.vehicleRepository.update(
      vehicleId,
      ownerId,
      dto,
    );

    if (!vehicle) {
      throw new NotFoundException(VEHICLE_MESSAGES.NOT_FOUND);
    }

    return vehicle;
  }
}
