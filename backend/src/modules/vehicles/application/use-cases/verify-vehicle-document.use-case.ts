import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { VEHICLE_DOCUMENT_REPOSITORY } from '../../domain/repositories/vehicle-document.repository';
import type { IVehicleDocumentRepository } from '../../domain/repositories/vehicle-document.repository';
import { VEHICLE_DOCUMENT_VERIFICATION } from '../ports/vehicle-document-verification';
import type { IVehicleDocumentVerification } from '../ports/vehicle-document-verification';
import {
  DocumentVerificationStatus,
  VehicleDocumentType,
} from '../../domain/enums/vehicle-document.enums';
import { VehicleVerificationStatus } from '../../domain/enums/vehicle.enums';
import type {
  IVerifyVehicleDocumentUseCase,
  VerifyVehicleDocumentResult,
} from '../interfaces/verify-vehicle-document.use-case.interface';

@Injectable()
export class VerifyVehicleDocumentUseCase implements IVerifyVehicleDocumentUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,

    @Inject(VEHICLE_DOCUMENT_REPOSITORY)
    private readonly vehicleDocumentRepository: IVehicleDocumentRepository,

    @Inject(VEHICLE_DOCUMENT_VERIFICATION)
    private readonly documentVerification: IVehicleDocumentVerification,
  ) {}

  async execute(
    documentId: string,
    userId: string,
  ): Promise<VerifyVehicleDocumentResult> {
    const document = await this.vehicleDocumentRepository.findById(documentId);

    if (!document) {
      throw new NotFoundException('Vehicle document not found.');
    }

    const vehicle = await this.vehicleRepository.findByIdAndOwner(
      document.vehicleId,
      userId,
    );

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found.');
    }

    const latestDocument =
      await this.vehicleDocumentRepository.findLatestByVehicleAndType(
        document.vehicleId,
        document.documentType,
      );

    if (!latestDocument || latestDocument.id !== document.id) {
      throw new BadRequestException(
        'Only the latest uploaded document can be verified.',
      );
    }

    const extracted = await this.documentVerification.extractData(
      document.documentKey,
      document.mimeType,
    );

    let status = DocumentVerificationStatus.REQUIRES_REVIEW;
    let rejectionReason: string | null = null;

    if (!extracted.isReadable || !extracted.registrationNumber) {
      status = DocumentVerificationStatus.REQUIRES_REVIEW;
    } else {
      const expectedRegistration = vehicle.registrationNumber
        .replace(/[\s-]/g, '')
        .toUpperCase();

      if (extracted.registrationNumber !== expectedRegistration) {
        status = DocumentVerificationStatus.REQUIRES_REVIEW;
        rejectionReason = 'Registration number does not match the vehicle.';
      } else if (
        document.documentType !== VehicleDocumentType.REGISTRATION_CERTIFICATE
      ) {
        if (!extracted.expiryDate) {
          status = DocumentVerificationStatus.REQUIRES_REVIEW;
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const expiryDate = new Date(extracted.expiryDate);
          expiryDate.setHours(0, 0, 0, 0);

          if (expiryDate < today) {
            status = DocumentVerificationStatus.REJECTED;
            rejectionReason = 'Document has expired.';
          } else {
            status = DocumentVerificationStatus.APPROVED;
          }
        }
      } else {
        status = DocumentVerificationStatus.APPROVED;
      }
    }

    const updatedDocument =
      await this.vehicleDocumentRepository.updateVerificationResult(
        document.id,
        status,
        rejectionReason,
        extracted.expiryDate,
      );

    if (!updatedDocument) {
      throw new NotFoundException('Vehicle document not found.');
    }

    const latestDocuments =
      await this.vehicleDocumentRepository.findByVehicleId(document.vehicleId);

    const requiredTypes = Object.values(VehicleDocumentType);

    const latestDocumentsByType = requiredTypes.map(
      (type) =>
        latestDocuments
          .filter((item) => item.documentType === type)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0],
    );

    const allApproved = latestDocumentsByType.every(
      (document) =>
        document?.verificationStatus === DocumentVerificationStatus.APPROVED,
    );

    const hasRejected = latestDocumentsByType.some(
      (document) =>
        document?.verificationStatus === DocumentVerificationStatus.REJECTED,
    );

    const vehicleStatus = allApproved
      ? VehicleVerificationStatus.APPROVED
      : hasRejected
        ? VehicleVerificationStatus.REJECTED
        : VehicleVerificationStatus.PENDING;

    await this.vehicleRepository.updateVerificationStatus(
      document.vehicleId,
      vehicleStatus,
    );

    return {
      documentId: updatedDocument.id,
      verificationStatus: updatedDocument.verificationStatus,
      rejectionReason: updatedDocument.rejectionReason,
      expiryDate: updatedDocument.expiryDate,
      vehicleVerificationStatus: vehicleStatus,
    };
  }
}
