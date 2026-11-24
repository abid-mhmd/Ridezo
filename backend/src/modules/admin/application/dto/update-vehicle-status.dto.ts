import { IsEnum } from 'class-validator';
import { VehicleVerificationStatus } from '../../../vehicles/domain/enums/vehicle.enums';

export class UpdateVehicleStatusDto {
  @IsEnum(VehicleVerificationStatus)
  status: VehicleVerificationStatus;
}
