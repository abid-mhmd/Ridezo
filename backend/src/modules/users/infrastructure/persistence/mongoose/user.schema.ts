import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  AccountStatus,
  IdentityVerificationStatus,
  UserRole,
  SmokingPreference,
  SeatingComfortPreference,
  ClimateControlPreference,
  PetPreference,
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

@Schema({ _id: false })
export class UserPreferencesSchema {
  @Prop({
    type: String,
    enum: Object.values(SmokingPreference),
    default: 'no-preference',
  })
  smoking?: SmokingPreference;

  @Prop({
    type: String,
    enum: Object.values(PetPreference),
    default: 'no-preference',
  })
  pets?: PetPreference;

  @Prop({
    type: String,
    enum: Object.values(SeatingComfortPreference),
    default: 'no-preference',
  })
  seatingComfort?: SeatingComfortPreference;

  @Prop({
    type: String,
    enum: Object.values(ClimateControlPreference),
    default: 'no-preference',
  })
  climateControl?: ClimateControlPreference;
}

export const UserPreferencesSchemaDefinition = SchemaFactory.createForClass(
  UserPreferencesSchema,
);

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
    trim: true,
    maxlength: 50,
    default: '',
  })
  lastName: string;

  @Prop({
    type: String,
    select: false,
    default: undefined,
  })
  passwordHash?: string;

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

  @Prop({
    type: UserPreferencesSchemaDefinition,
    default: () => ({}),
  })
  preferences: UserPreferencesSchema;

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

  @Prop({
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  })
  googleId: string;

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
