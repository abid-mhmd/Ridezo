import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { VehicleVerificationStatus } from '../../domain/enums/vehicle.enums';
import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository';

import { VEHICLE_DOCUMENT_REPOSITORY } from '../../domain/repositories/vehicle-document.repository';
import type { IVehicleDocumentRepository } from '../../domain/repositories/vehicle-document.repository';

import { VEHICLE_DOCUMENT_STORAGE } from '../ports/vehicle-document-storage';
import type { IVehicleDocumentStorage } from '../ports/vehicle-document-storage';

import type { UploadVehicleDocumentDto } from '../dto/upload-vehicle-document.dto';
import type {
  IUploadVehicleDocumentUseCase,
  UploadVehicleDocumentResult,
} from '../interfaces/upload-vehicle-document.use-case.interface';

import { VEHICLE_MESSAGES } from '../../presentation/constants/vehicle-messages.constants';

@Injectable()
export class UploadVehicleDocumentUseCase implements IUploadVehicleDocumentUseCase {
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
    dto: UploadVehicleDocumentDto,
    file: Express.Multer.File,
  ): Promise<UploadVehicleDocumentResult> {
    if (!file) {
      throw new BadRequestException('Vehicle document is required.');
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only PDF, JPEG, and PNG documents are allowed.',
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException(
        'Vehicle document size must not exceed 5 MB.',
      );
    }

    const vehicle = await this.vehicleRepository.findByIdAndOwner(
      vehicleId,
      userId,
    );

    if (!vehicle) {
      throw new NotFoundException(VEHICLE_MESSAGES.NOT_FOUND);
    }

    const existingDocument =
      await this.vehicleDocumentRepository.findLatestByVehicleAndType(
        vehicleId,
        dto.documentType,
      );

    let objectKey: string | undefined;

    try {
      const uploadResult = await this.vehicleDocumentStorage.upload(
        file.buffer,
        file.mimetype,
      );

      objectKey = uploadResult.objectKey;

      const document = existingDocument
        ? await this.vehicleDocumentRepository.replaceDocument(
            existingDocument.id,
            {
              documentKey: objectKey,
              originalFileName: file.originalname,
              mimeType: file.mimetype,
              fileSize: file.size,
              expiryDate: null,
            },
          )
        : await this.vehicleDocumentRepository.create({
            vehicleId,
            documentType: dto.documentType,
            documentKey: objectKey,
            originalFileName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            expiryDate: null,
          });

      if (!document) {
        throw new InternalServerErrorException(
          VEHICLE_MESSAGES.DOCUMENT_UPLOAD_FAILED,
        );
      }

      if (existingDocument?.documentKey) {
        try {
          await this.vehicleDocumentStorage.delete(
            existingDocument.documentKey,
          );
        } catch {
          // Best-effort cleanup of old S3 file
        }
      }

      await this.vehicleRepository.updateVerificationStatus(
        vehicleId,
        VehicleVerificationStatus.PENDING,
      );

      return {
        id: document.id,
        vehicleId: document.vehicleId,
        documentType: document.documentType,
        verificationStatus: document.verificationStatus,
        expiryDate: document.expiryDate,
        createdAt: document.createdAt,
      };
    } catch {
      if (objectKey) {
        try {
          await this.vehicleDocumentStorage.delete(objectKey);
        } catch {}
      }

      throw new InternalServerErrorException(
        VEHICLE_MESSAGES.DOCUMENT_UPLOAD_FAILED,
      );
    }
  }
}
