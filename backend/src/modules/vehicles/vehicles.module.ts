import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VEHICLE_REPOSITORY } from './domain/repositories/vehicle.repository.js';
import {
  Vehicle,
  VehicleSchema,
} from './infrastructure/persistence/mongoose/vehicle.schema.js';
import { MongooseVehicleRepository } from './infrastructure/persistence/mongoose/mongoose-vehicle.repository.js';
import { AddVehicleUseCase } from './application/use-cases/add-vehicle.use-case.js';
import { VehicleController } from './presentation/vehicles.controller.js';
import { SecurityModule } from '../../infrastructure/redis/security/security.module.js';
import { UsersModule } from '../users/users.module.js';
import { GetMyVehiclesUseCase } from './application/use-cases/get-my-vehicles.js';
import { GetVehicleByIdUseCase } from './application/use-cases/get-vehicle-by-id.use-case.js';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.use-case.js';
import { DeactivateVehicleUseCase } from './application/use-cases/deactivate-vehicle.use-case.js';
import { VEHICLE_PHOTO_STORAGE } from './application/ports/vehicle-photo-storage.js';
import { CloudinaryVehiclePhotoStorage } from './infrastructure/persistence/mongoose/storage/cloudinary-vehicle-photo.storage.js';
import { UploadVehiclePhotoUseCase } from './application/use-cases/upload-vehicle-photo.use-case.js';

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
      useClass: CloudinaryVehiclePhotoStorage,
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
