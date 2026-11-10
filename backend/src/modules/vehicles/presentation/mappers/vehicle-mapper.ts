import type { VehicleEntity } from '../../domain/entities/vehicle.entity';
import type { VehicleResponseDto } from '../dto/vehicle-response.dto';

export class VehicleMapper {
  static toResponse(vehicle: VehicleEntity): VehicleResponseDto {
    return {
      id: vehicle.id,
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      registrationNumber: vehicle.registrationNumber,
      seatCapacity: vehicle.seatCapacity,
      fuelType: vehicle.fuelType,
      vehiclePhoto: vehicle.vehiclePhoto,
      verificationStatus: vehicle.verificationStatus,
      isActive: vehicle.isActive,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }

  static toRepsoseList(vehicle: VehicleEntity[]): VehicleResponseDto[] {
    return vehicle.map((vehicle) => this.toResponse(vehicle));
  }
}
