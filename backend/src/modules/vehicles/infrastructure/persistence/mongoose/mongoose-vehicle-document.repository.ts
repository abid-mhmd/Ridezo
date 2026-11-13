import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';
import type {
  CreateVehicleDocumentData,
  IVehicleDocumentRepository,
} from '../../../domain/repositories/vehicle-document.repository';
import type { VehicleDocumentEntity } from '../../../domain/entities/vehicle-document.entity';
import {
  VehicleDocument,
  type VehicleDocumentDocument,
} from './vehicle-document.schema';
import { BaseMongooseRepository } from '../../../../../infrastructure/persistence/mongoose/base-mongoose.repository';
import type { VehicleDocumentType } from '../../../domain/enums/vehicle-document.enums';
import type { DocumentVerificationStatus } from '../../../domain/enums/vehicle-document.enums';

@Injectable()
export class MongooseVehicleDocumentRepository
  extends BaseMongooseRepository<VehicleDocument>
  implements IVehicleDocumentRepository
{
  constructor(
    @InjectModel(VehicleDocument.name)
    model: Model<VehicleDocument>,
  ) {
    super(model);
  }

  async create(
    data: CreateVehicleDocumentData,
  ): Promise<VehicleDocumentEntity> {
    const document = await this.createDocument({
      ...data,
      vehicleId: new Types.ObjectId(data.vehicleId),
    });

    return this.toEntity(document);
  }

  async findByVehicleId(vehicleId: string): Promise<VehicleDocumentEntity[]> {
    if (!Types.ObjectId.isValid(vehicleId)) {
      return [];
    }

    const documents = await this.model
      .find({ vehicleId: new Types.ObjectId(vehicleId) })
      .sort({ documentType: 1, createdAt: -1 })
      .exec();

    return documents.map((document) => this.toEntity(document));
  }

  async findLatestByVehicleAndType(
    vehicleId: string,
    documentType: VehicleDocumentType,
  ): Promise<VehicleDocumentEntity | null> {
    if (!Types.ObjectId.isValid(vehicleId)) {
      return null;
    }

    const document = await this.model
      .findOne({
        vehicleId: new Types.ObjectId(vehicleId),
        documentType,
      })
      .sort({ createdAt: -1 })
      .exec();

    return document ? this.toEntity(document) : null;
  }

  async updateVerificationResult(
    documentId: string,
    status: DocumentVerificationStatus,
    rejectionReason?: string | null,
    expiryDate?: Date | null,
  ): Promise<VehicleDocumentEntity | null> {
    if (!Types.ObjectId.isValid(documentId)) {
      return null;
    }

    const updateData: Record<string, unknown> = {
      verificationStatus: status,
    };

    if (rejectionReason !== undefined) {
      updateData.rejectionReason = rejectionReason;
    }

    if (expiryDate !== undefined) {
      updateData.expiryDate = expiryDate;
    }

    const document = await this.model
      .findByIdAndUpdate(
        documentId,
        { $set: updateData },
        { new: true, runValidators: true },
      )
      .exec();

    return document ? this.toEntity(document as VehicleDocumentDocument) : null;
  }

  async findById(documentId: string): Promise<VehicleDocumentEntity | null> {
    if (!Types.ObjectId.isValid(documentId)) {
      return null;
    }

    const document = await this.model.findById(documentId).exec();

    return document ? this.toEntity(document) : null;
  }

  private toEntity(document: VehicleDocumentDocument): VehicleDocumentEntity {
    return {
      id: document._id.toString(),
      vehicleId: document.vehicleId.toString(),
      documentType: document.documentType,
      documentKey: document.documentKey,
      originalFileName: document.originalFileName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      verificationStatus: document.verificationStatus,
      expiryDate: document.expiryDate,
      rejectionReason: document.rejectionReason,
      reviewedAt: document.reviewedAt,
      reviewedBy: document.reviewedBy?.toString() ?? null,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
