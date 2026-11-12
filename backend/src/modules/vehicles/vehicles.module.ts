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
import { ADD_VEHICLE_USE_CASE } from './application/interfaces/add-vehicle.use-case.interface';
import { GET_MY_VEHICLES_USE_CASE } from './application/interfaces/get-my-vehicles.use-case.interface';
import { GET_VEHICLE_BY_ID_USE_CASE } from './application/interfaces/get-vehicle-by-id.use-case.interface';
import { UPDATE_VEHICLE_USE_CASE } from './application/interfaces/update-vehicle.use-case.interface';
import { DEACTIVATE_VEHICLE_USE_CASE } from './application/interfaces/deactivate-vehicle.use-case.interface';
import { UPLOAD_VEHICLE_PHOTO_USE_CASE } from './application/interfaces/upload-vehicle-photo.use-case.interface';

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
    {
      provide: UPLOAD_VEHICLE_PHOTO_USE_CASE,
      useClass: UploadVehiclePhotoUseCase,
    },
    {
      provide: ADD_VEHICLE_USE_CASE,
      useClass: AddVehicleUseCase,
    },
    {
      provide: GET_MY_VEHICLES_USE_CASE,
      useClass: GetMyVehiclesUseCase,
    },
    {
      provide: GET_VEHICLE_BY_ID_USE_CASE,
      useClass: GetVehicleByIdUseCase,
    },
    {
      provide: UPDATE_VEHICLE_USE_CASE,
      useClass: UpdateVehicleUseCase,
    },
    {
      provide: DEACTIVATE_VEHICLE_USE_CASE,
      useClass: DeactivateVehicleUseCase,
    },
  ],

  exports: [VEHICLE_REPOSITORY],
})
export class VehiclesModule {}
