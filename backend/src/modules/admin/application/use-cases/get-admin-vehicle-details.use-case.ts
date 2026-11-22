import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  VEHICLE_REPOSITORY,
  type IVehicleRepository,
} from '../../../vehicles/domain/repositories/vehicle.repository';
import {
  VEHICLE_DOCUMENT_REPOSITORY,
  type IVehicleDocumentRepository,
} from '../../../vehicles/domain/repositories/vehicle-document.repository';
import {
  VEHICLE_PHOTO_STORAGE,
  type IVehiclePhotoStorage,
} from '../../../vehicles/application/ports/vehicle-photo-storage';
import {
  VEHICLE_DOCUMENT_STORAGE,
  type IVehicleDocumentStorage,
} from '../../../vehicles/application/ports/vehicle-document-storage';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../users/domain/repositories/user.repository';
import {
  PROFILE_PHOTO_STORAGE,
  type IProfilePhotoStorage,
} from '../../../users/application/ports/profile-photo-storage';
import type {
  AdminVehicleDetailsResult,
  IGetAdminVehicleDetailsUseCase,
} from '../interfaces/get-admin-vehicle-details.use-case.interface';

@Injectable()
export class GetAdminVehicleDetailsUseCase implements IGetAdminVehicleDetailsUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,

    @Inject(VEHICLE_DOCUMENT_REPOSITORY)
    private readonly vehicleDocumentRepository: IVehicleDocumentRepository,

    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,

    @Inject(VEHICLE_DOCUMENT_STORAGE)
    private readonly vehicleDocumentStorage: IVehicleDocumentStorage,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,
  ) {}

  async execute(vehicleId: string): Promise<AdminVehicleDetailsResult> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found.');
    }

    const [owner, rawDocuments, vehiclePhoto] = await Promise.all([
      this.userRepository.findById(vehicle.ownerId),
      this.vehicleDocumentRepository.findByVehicleId(vehicle.id),
      vehicle.vehiclePhoto && !vehicle.vehiclePhoto.startsWith('http')
        ? this.vehiclePhotoStorage.getUrl(vehicle.vehiclePhoto)
        : Promise.resolve(vehicle.vehiclePhoto ?? ''),
    ]);

    const documents = await Promise.all(
      rawDocuments.map(async (document) => ({
        document,
        documentUrl: document.documentKey
          ? await this.vehicleDocumentStorage.getUrl(document.documentKey)
          : '',
      })),
    );

    let ownerSummary = null;
    if (owner) {
      const ownerPhoto =
        owner.profilePhoto && !owner.profilePhoto.startsWith('http')
          ? await this.profilePhotoStorage.getUrl(owner.profilePhoto)
          : (owner.profilePhoto ?? '');

      ownerSummary = {
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email,
        phone: owner.phone,
        profilePhoto: ownerPhoto,
        emailVerified: owner.emailVerified,
        phoneVerified: owner.phoneVerified,
      };
    }

    return {
      vehicle: {
        ...vehicle,
        vehiclePhoto,
      },
      owner: ownerSummary,
      documents,
    };
  }
}
