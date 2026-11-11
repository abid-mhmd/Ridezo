import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VEHICLE_REPOSITORY } from './domain/repositories/vehicle.repository';
import {
  Vehicle,
  VehicleSchema,
} from './infrastructure/persistence/mongoose/vehicle.schema';
import { MongooseVehicleRepository } from './infrastructure/persistence/mongoose/mongoose-vehicle.repository';
import { AddVehicleUseCase } from './application/use-cases/add-vehicle.use-case';
import { VehicleController } from './presentation/vehicles.controller';
import { SecurityModule } from '../../infrastructure/redis/security/security.module';
import { UsersModule } from '../users/users.module';
import { GetMyVehiclesUseCase } from './application/use-cases/get-my-vehicles';
import { GetVehicleByIdUseCase } from './application/use-cases/get-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.use-case';
import { DeactivateVehicleUseCase } from './application/use-cases/deactivate-vehicle.use-case';
import { S3VehiclePhotoStorage } from './infrastructure/persistence/mongoose/storage/s3-vehicle-photo.storage';
import { VEHICLE_PHOTO_STORAGE } from './application/ports/vehicle-photo-storage';
import { UploadVehiclePhotoUseCase } from './application/use-cases/upload-vehicle-photo.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Vehicle.name,
        schema: VehicleSchema,
      },
    ]),
    UsersModule,
    SecurityModule,
  ],
  controllers: [VehicleController],
  providers: [
    {
      provide: VEHICLE_REPOSITORY,
      useClass: MongooseVehicleRepository,
    },
    {
      provide: VEHICLE_PHOTO_STORAGE,
      useClass: S3VehiclePhotoStorage,
    },
    UploadVehiclePhotoUseCase,
    AddVehicleUseCase,
    GetMyVehiclesUseCase,
    GetVehicleByIdUseCase,
    UpdateVehicleUseCase,
    DeactivateVehicleUseCase,
  ],
  exports: [VEHICLE_REPOSITORY],
})
export class VehiclesModule {}
