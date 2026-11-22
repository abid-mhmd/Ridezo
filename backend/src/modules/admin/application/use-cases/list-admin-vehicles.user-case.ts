import { Inject, Injectable } from '@nestjs/common';
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
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../users/domain/repositories/user.repository';
import {
  PROFILE_PHOTO_STORAGE,
  type IProfilePhotoStorage,
} from '../../../users/application/ports/profile-photo-storage';
import type { AdminVehicleListQueryDto } from '../dto/admin-vehicle-query.dto';
import type {
  IListAdminVehiclesUseCase,
  ListAdminVehiclesResult,
} from '../interfaces/list-admin-vehicles.use-case.interface';

@Injectable()
export class ListAdminVehiclesUseCase implements IListAdminVehiclesUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,

    @Inject(VEHICLE_DOCUMENT_REPOSITORY)
    private readonly vehicleDocumentRepository: IVehicleDocumentRepository,

    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,
  ) {}

  async execute(
    query: AdminVehicleListQueryDto,
  ): Promise<ListAdminVehiclesResult> {
    const { vehicles, total } = await this.vehicleRepository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      status: query.status,
    });

    const ownerIds = [...new Set(vehicles.map((v) => v.ownerId))];
    const owners = await this.userRepository.findByIds(ownerIds);
    const ownerMap = new Map(owners.map((owner) => [owner.id, owner]));

    const items = await Promise.all(
      vehicles.map(async (vehicle) => {
        const [documents, vehiclePhoto] = await Promise.all([
          this.vehicleDocumentRepository.findByVehicleId(vehicle.id),
          vehicle.vehiclePhoto && !vehicle.vehiclePhoto.startsWith('http')
            ? this.vehiclePhotoStorage.getUrl(vehicle.vehiclePhoto)
            : Promise.resolve(vehicle.vehiclePhoto ?? ''),
        ]);

        const approved = documents.filter((d) =>
          ['approved', 'verified'].includes(
            String(d.verificationStatus).toLowerCase(),
          ),
        ).length;
        const rejected = documents.filter(
          (d) => String(d.verificationStatus).toLowerCase() === 'rejected',
        ).length;
        const pending = documents.length - approved - rejected;

        const owner = ownerMap.get(vehicle.ownerId);
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
          documentsSummary: {
            total: documents.length,
            approved,
            pending,
            rejected,
          },
        };
      }),
    );

    return {
      vehicles: items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
