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
import { MongooseVehicleDocumentRepository } from './infrastructure/persistence/mongoose/mongoose-vehicle-document.repository';
import { VEHICLE_DOCUMENT_REPOSITORY } from './domain/repositories/vehicle-document.repository';
import {
  VehicleDocument,
  VehicleDocumentSchema,
} from './infrastructure/persistence/mongoose/vehicle-document.schema';
import { VEHICLE_DOCUMENT_STORAGE } from './application/ports/vehicle-document-storage';
import { S3VehicleDocumentStorage } from './infrastructure/persistence/mongoose/storage/s3-vehicle-document.storage';
import { UPLOAD_VEHICLE_DOCUMENT_USE_CASE } from './application/interfaces/upload-vehicle-document.use-case.interface';
import { UploadVehicleDocumentUseCase } from './application/use-cases/upload-vehicle-document.use-case';
import { GET_VEHICLE_DOCUMENTS_USE_CASE } from './application/interfaces/get-vehicle-documents.use-case.interface';
import { GetVehicleDocumentsUseCase } from './application/use-cases/get-vehicle-documents.use-case';
import { VEHICLE_DOCUMENT_VERIFICATION } from './application/ports/vehicle-document-verification';
import { TesseractVehicleDocumentVerificationService } from './infrastructure/verification/tesseract-vehicle-document-verification.service';
import { VERIFY_VEHICLE_DOCUMENT_USE_CASE } from './application/interfaces/verify-vehicle-document.use-case.interface';
import { VerifyVehicleDocumentUseCase } from './application/use-cases/verify-vehicle-document.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Vehicle.name,
        schema: VehicleSchema,
      },
      {
        name: VehicleDocument.name,
        schema: VehicleDocumentSchema,
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
    {
      provide: VEHICLE_DOCUMENT_REPOSITORY,
      useClass: MongooseVehicleDocumentRepository,
    },
    {
      provide: VEHICLE_DOCUMENT_STORAGE,
      useClass: S3VehicleDocumentStorage,
    },
    {
      provide: UPLOAD_VEHICLE_DOCUMENT_USE_CASE,
      useClass: UploadVehicleDocumentUseCase,
    },
    {
      provide: GET_VEHICLE_DOCUMENTS_USE_CASE,
      useClass: GetVehicleDocumentsUseCase,
    },
    {
      provide: VEHICLE_DOCUMENT_VERIFICATION,
      useClass: TesseractVehicleDocumentVerificationService,
    },
    {
      provide: VERIFY_VEHICLE_DOCUMENT_USE_CASE,
      useClass: VerifyVehicleDocumentUseCase,
    },
  ],

  exports: [VEHICLE_REPOSITORY, VEHICLE_DOCUMENT_REPOSITORY],
})
export class VehiclesModule {}
