import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { RideStatus } from '../../../domain/enums/ride.enums';

import {
  SmokingPreference,
  PetPreference,
  SeatingComfortPreference,
  ClimateControlPreference,
} from '../../../../users/domain/enums/user.enums';

export type RideDocument = HydratedDocument<Ride> & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ _id: false })
export class RideCoordinates {
  @Prop({
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point',
  })
  type: 'Point';

  @Prop({
    type: [Number],
    required: true,
    validate: {
      validator: (coordinates: number[]) => coordinates.length === 2,
      message: 'Coordinates must contain longitude and latitude.',
    },
  })
  coordinates: [number, number];
}

export const RideCoordinatesSchema =
  SchemaFactory.createForClass(RideCoordinates);

// Location
@Schema({ _id: false })
export class RideLocation {
  @Prop({ type: String, required: true })
  placeId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({
    type: RideCoordinatesSchema,
    required: true,
  })
  coordinates: RideCoordinates;
}

export const RideLocationSchema = SchemaFactory.createForClass(RideLocation);

// Ride preferences
@Schema({ _id: false })
export class RidePreferences {
  @Prop({
    type: String,
    enum: Object.values(SmokingPreference),
  })
  smoking?: SmokingPreference;

  @Prop({
    type: String,
    enum: Object.values(PetPreference),
  })
  pets?: PetPreference;

  @Prop({
    type: String,
    enum: Object.values(SeatingComfortPreference),
  })
  seatingComfort?: SeatingComfortPreference;

  @Prop({
    type: String,
    enum: Object.values(ClimateControlPreference),
  })
  climateControl?: ClimateControlPreference;
}

export const RidePreferencesSchema =
  SchemaFactory.createForClass(RidePreferences);

// Main Ride
@Schema({ timestamps: true, versionKey: false })
export class Ride {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  driverId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  })
  vehicleId: Types.ObjectId;

  @Prop({
    type: RideLocationSchema,
    required: true,
  })
  origin: RideLocation;

  @Prop({
    type: RideLocationSchema,
    required: true,
  })
  destination: RideLocation;

  @Prop({
    type: [RideLocationSchema],
    default: [],
  })
  stops: RideLocation[];

  @Prop({
    type: Date,
    required: true,
  })
  departureTime: Date;

  @Prop({
    type: Number,
    required: true,
    min: 1,
  })
  totalSeats: number;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  availableSeats: number;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  pricePerSeat: number;

  @Prop({
    type: RidePreferencesSchema,
    default: {},
  })
  preferences: RidePreferences;

  @Prop({
    type: String,
    default: '',
    trim: true,
  })
  pickupInstructions: string;

  @Prop({
    type: String,
    enum: Object.values(RideStatus),
    default: RideStatus.SCHEDULED,
  })
  status: RideStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const RideSchema = SchemaFactory.createForClass(Ride);

// Indexes
RideSchema.index({ driverId: 1, departureTime: -1 });
RideSchema.index({ status: 1, departureTime: 1 });
RideSchema.index({ 'origin.coordinates': '2dsphere' });
