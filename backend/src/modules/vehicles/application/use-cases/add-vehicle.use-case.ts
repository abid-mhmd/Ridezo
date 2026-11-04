import { Inject, Injectable } from '@nestjs/common';
import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository.js';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository.js';
import type { AddVehicleDto } from '../dto/add-vehicle.dto.js';
import type { VehicleEntity } from '../../domain/entities/vehicle.entity.js';

export class VehicleRegistrationAlreadyExistsError extends Error {
  constructor() {
    super('A vehicle with this registration number already exists.');
    this.name = 'VehicleRegistrationAlreadyExistsError';
  }
}

@Injectable()
export class AddVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(ownerId: string, dto: AddVehicleDto): Promise<VehicleEntity> {
    const registrationNumber = dto.registrationNumber
      .replace(/[\s-]/g, '')
      .toUpperCase();

    const registrationExists =
      await this.vehicleRepository.existsByRegistrationNumber(
        registrationNumber,
      );

    if (registrationExists) {
      throw new VehicleRegistrationAlreadyExistsError();
    }

    return this.vehicleRepository.create({
      ...dto,
      ownerId,
      registrationNumber,
      vehiclePhoto: dto.vehiclePhoto ?? '',
    });
  }
}
