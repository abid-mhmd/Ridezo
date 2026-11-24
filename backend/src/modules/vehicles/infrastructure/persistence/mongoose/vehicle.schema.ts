import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  FuelType,
  VehicleType,
  VehicleVerificationStatus,
} from '../../../domain/enums/vehicle.enums';

export type VehicleDocument = HydratedDocument<Vehicle> & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true, versionKey: false })
export class Vehicle {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  ownerId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(VehicleType),
    required: true,
  })
  vehicleType: VehicleType;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  brand: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  model: string;

  @Prop({
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1,
  })
  year: number;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  color: string;

  @Prop({
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    unique: true,
  })
  registrationNumber: string;

  @Prop({
    type: Number,
    required: true,
    min: 1,
  })
  seatCapacity: number;

  @Prop({
    type: String,
    enum: Object.values(FuelType),
    required: true,
  })
  fuelType: FuelType;

  @Prop({
    type: String,
    default: '',
  })
  vehiclePhoto: string;

  @Prop({
    type: String,
    enum: Object.values(VehicleVerificationStatus),
    default: VehicleVerificationStatus.PENDING,
  })
  verificationStatus: VehicleVerificationStatus;

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
VehicleSchema.index({ ownerId: 1, createdAt: -1 });
