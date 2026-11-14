import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository';

import { VEHICLE_DOCUMENT_REPOSITORY } from '../../domain/repositories/vehicle-document.repository';
import type { IVehicleDocumentRepository } from '../../domain/repositories/vehicle-document.repository';

import { VEHICLE_DOCUMENT_STORAGE } from '../ports/vehicle-document-storage';
import type { IVehicleDocumentStorage } from '../ports/vehicle-document-storage';

import type {
  IGetVehicleDocumentsUseCase,
  VehicleDocumentListResult,
} from '../interfaces/get-vehicle-documents.use-case.interface';

import { VEHICLE_MESSAGES } from '../../presentation/constants/vehicle-messages.constants';

@Injectable()
export class GetVehicleDocumentsUseCase implements IGetVehicleDocumentsUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,

    @Inject(VEHICLE_DOCUMENT_REPOSITORY)
    private readonly vehicleDocumentRepository: IVehicleDocumentRepository,

    @Inject(VEHICLE_DOCUMENT_STORAGE)
    private readonly vehicleDocumentStorage: IVehicleDocumentStorage,
  ) {}

  async execute(
    userId: string,
    vehicleId: string,
  ): Promise<VehicleDocumentListResult[]> {
    const vehicle = await this.vehicleRepository.findByIdAndOwner(
      vehicleId,
      userId,
    );

    if (!vehicle) {
      throw new NotFoundException(VEHICLE_MESSAGES.NOT_FOUND);
    }

    const documents =
      await this.vehicleDocumentRepository.findByVehicleId(vehicleId);

    try {
      return await Promise.all(
        documents.map(async (document) => ({
          id: document.id,
          vehicleId: document.vehicleId,
          documentType: document.documentType,
          verificationStatus: document.verificationStatus,
          documentUrl: await this.vehicleDocumentStorage.getUrl(
            document.documentKey,
          ),
          expiryDate: document.expiryDate,
          createdAt: document.createdAt,
        })),
      );
    } catch {
      throw new InternalServerErrorException(
        'Unable to retrieve vehicle documents. Please try again.',
      );
    }
  }
}
