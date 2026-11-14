import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import {
  VehicleDocumentType,
  DocumentVerificationStatus,
} from '../../../domain/enums/vehicle-document.enums';

export type VehicleDocumentDocument = HydratedDocument<VehicleDocument> & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true, versionKey: false })
export class VehicleDocument {
  @Prop({
    type: Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  })
  vehicleId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(VehicleDocumentType),
    required: true,
  })
  documentType: VehicleDocumentType;

  @Prop({
    type: String,
    required: true,
  })
  documentKey: string;

  @Prop({
    type: String,
    required: true,
  })
  originalFileName: string;

  @Prop({
    type: String,
    required: true,
  })
  mimeType: string;

  @Prop({
    type: Number,
    required: true,
    min: 1,
  })
  fileSize: number;

  @Prop({
    type: String,
    enum: Object.values(DocumentVerificationStatus),
    default: DocumentVerificationStatus.PENDING,
  })
  verificationStatus: DocumentVerificationStatus;

  @Prop({
    type: Date,
    default: null,
  })
  expiryDate: Date | null;

  @Prop({
    type: String,
    default: null,
  })
  rejectionReason: string | null;

  @Prop({
    type: Date,
    default: null,
  })
  reviewedAt: Date | null;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    default: null,
  })
  reviewedBy: Types.ObjectId | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const VehicleDocumentSchema =
  SchemaFactory.createForClass(VehicleDocument);

VehicleDocumentSchema.index({ vehicleId: 1, documentType: 1, createdAt: -1 });

VehicleDocumentSchema.index({
  vehicleId: 1,
  verificationStatus: 1,
});
