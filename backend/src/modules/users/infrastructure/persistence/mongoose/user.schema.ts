import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
}

export enum IdentityVerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class IdentityVerification {
  @Prop({
    type: String,
    enum: IdentityVerificationStatus,
    default: IdentityVerificationStatus.UNVERIFIED,
  })
  status!: IdentityVerificationStatus;

  @Prop({ type: Date, default: null })
  verifiedAt!: Date | null;
}

export const IdentityVerificationSchema =
  SchemaFactory.createForClass(IdentityVerification);

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
export class UserPreferences {
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  ridePreferences!: Record<string, unknown>;
}

export const UserPreferencesSchema =
  SchemaFactory.createForClass(UserPreferences);

@Schema({
  collection: 'users',
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  firstName!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  lastName!: string;

  @Prop({
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  })
  email!: string;

  @Prop({
    type: String,
    trim: true,
    default: null,
  })
  phone!: string | null;

  @Prop({
    type: String,
    required: true,
    select: false,
  })
  passwordHash!: string;

  @Prop({
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  })
  about!: string;

  @Prop({
    type: String,
    default: null,
  })
  profilePhoto!: string | null;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER,
    required: true,
  })
  role!: UserRole;

  @Prop({
    type: String,
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
    required: true,
  })
  accountStatus!: AccountStatus;

  @Prop({
    type: Boolean,
    default: false,
  })
  emailVerified!: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  phoneVerified!: boolean;

  @Prop({
    type: IdentityVerificationSchema,
    default: () => ({}),
  })
  identityVerification!: IdentityVerification;

  @Prop({
    type: UserLocationSchema,
    default: null,
  })
  location!: UserLocation | null;

  @Prop({
    type: [String],
    default: [],
  })
  languages!: string[];

  @Prop({
    type: UserPreferencesSchema,
    default: () => ({}),
  })
  preferences!: UserPreferences;

  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  completedRideCount!: number;

  @Prop({
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  })
  rating!: number;

  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  reviewCount!: number;

  createdAt!: Date;

  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });

UserSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $type: 'string' },
    },
  },
);
