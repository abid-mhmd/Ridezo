import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  AccountStatus,
  IdentityVerificationStatus,
  UserRole,
} from '../../../domain/enums/user.enums.js';

export type UserDocument = HydratedDocument<User> & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ _id: false })
export class UserLocation {
  @Prop({ type: String, trim: true })
  city?: string;

  @Prop({ type: String, trim: true })
  state?: string;

  @Prop({ type: String, trim: true })
  country?: string;
}

export const UserLocationSchema = SchemaFactory.createForClass(UserLocation);

@Schema({ _id: false })
export class IdentityVerification {
  @Prop({
    type: String,
    enum: IdentityVerificationStatus,
    default: IdentityVerificationStatus.NOT_STARTED,
  })
  status: IdentityVerificationStatus;

  @Prop({ type: Date, default: null })
  verifiedAt: Date | null;
}

export const IdentityVerificationSchema =
  SchemaFactory.createForClass(IdentityVerification);

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    maxlength: 50,
  })
  lastName: string;
  @Prop({
    type: String,
    required: true,
    select: false,
  })
  passwordHash: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
  })
  email: string;

  @Prop({
    type: String,
    trim: true,
    default: undefined,
  })
  phone?: string;

  @Prop({
    type: String,
    trim: true,
    maxLength: 500,
    default: '',
  })
  about: string;

  @Prop({ type: String, default: '' })
  profilePhoto: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER,
    required: true,
  })
  role: UserRole;

  @Prop({
    type: String,
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
    required: true,
  })
  accountStatus: AccountStatus;

  @Prop({ type: Boolean, default: false })
  emailVerified: boolean;

  @Prop({ type: Boolean, default: false })
  phoneVerified: boolean;

  @Prop({
    type: IdentityVerificationSchema,
    default: () => ({}),
  })
  identityVerification: IdentityVerification;

  @Prop({ type: UserLocationSchema, default: undefined })
  location: UserLocation;

  @Prop({ type: [String], default: [] })
  languages: string[];

  @Prop({ type: Number, min: 0, default: 0 })
  completedRideCount: number;

  @Prop({
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  })
  rating: number;

  @Prop({ type: Number, min: 0, default: 0 })
  reviewCount: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: 'string' } } },
);
