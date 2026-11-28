import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import {
  RideLocation,
  RideLocationSchema,
  RidePreferences,
  RidePreferencesSchema,
} from '../../../../rides/infrastructure/persistence/mongoose/ride.schema';
import { RECURRING_RIDE_CONSTANTS } from '../../../domain/constants/recurring-ride.constants';
import { RecurringRideStatus } from '../../../domain/enums/recurring-ride.enums';

export type RecurringRideDocument = HydratedDocument<RecurringRide> & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({
  collection: 'recurring_rides',
  timestamps: true,
  versionKey: false,
})
export class RecurringRide {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driverId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicleId: Types.ObjectId;

  @Prop({ type: RideLocationSchema, required: true })
  origin: RideLocation;

  @Prop({ type: RideLocationSchema, required: true })
  destination: RideLocation;

  @Prop({ type: [RideLocationSchema], default: [] })
  stops: RideLocation[];

  @Prop({
    type: [Number],
    required: true,
    validate: {
      validator: (days: number[]) =>
        days.length > 0 &&
        days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
      message: 'daysOfWeek must contain valid weekdays (0-6).',
    },
  })
  daysOfWeek: number[];

  @Prop({
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/,
  })
  departureTime: string;

  @Prop({
    type: String,
    default: RECURRING_RIDE_CONSTANTS.DEFAULT_TIMEZONE,
  })
  timezone: string;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, default: null })
  endDate: Date | null;

  @Prop({ type: Number, required: true, min: 1 })
  totalSeats: number;

  @Prop({ type: Number, required: true, min: 0 })
  pricePerSeat: number;

  @Prop({ type: RidePreferencesSchema, default: {} })
  preferences: RidePreferences;

  @Prop({ type: String, default: '', trim: true })
  pickupInstructions: string;

  @Prop({
    type: Number,
    default: RECURRING_RIDE_CONSTANTS.DEFAULT_GENERATE_AHEAD_DAYS,
    min: RECURRING_RIDE_CONSTANTS.MIN_GENERATE_AHEAD_DAYS,
    max: RECURRING_RIDE_CONSTANTS.MAX_GENERATE_AHEAD_DAYS,
  })
  generateAheadDays: number;

  @Prop({ type: Date, default: null })
  lastGeneratedDate: Date | null;

  @Prop({
    type: String,
    enum: Object.values(RecurringRideStatus),
    default: RecurringRideStatus.ACTIVE,
  })
  status: RecurringRideStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const RecurringRideSchema = SchemaFactory.createForClass(RecurringRide);

RecurringRideSchema.index({ driverId: 1, createdAt: -1 });
RecurringRideSchema.index({ status: 1, startDate: 1, endDate: 1 });
