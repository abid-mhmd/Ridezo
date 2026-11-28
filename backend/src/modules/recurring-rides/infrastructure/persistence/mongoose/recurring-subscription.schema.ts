import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { RecurringSubscriptionStatus } from '../../../domain/enums/recurring-ride.enums';

export type RecurringSubscriptionDocument =
  HydratedDocument<RecurringSubscription> & {
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({
  collection: 'recurring_subscriptions',
  timestamps: true,
  versionKey: false,
})
export class RecurringSubscription {
  @Prop({ type: Types.ObjectId, ref: 'RecurringRide', required: true })
  recurringRideId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  passengerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driverId: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 1 })
  seatsRequested: number;

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

  @Prop({ type: String, default: '', trim: true })
  message: string;

  @Prop({ type: String, default: '', trim: true })
  rejectionReason: string;

  @Prop({
    type: String,
    enum: Object.values(RecurringSubscriptionStatus),
    default: RecurringSubscriptionStatus.PENDING,
  })
  status: RecurringSubscriptionStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const RecurringSubscriptionSchema = SchemaFactory.createForClass(
  RecurringSubscription,
);

RecurringSubscriptionSchema.index({ recurringRideId: 1, status: 1 });
RecurringSubscriptionSchema.index({ passengerId: 1, createdAt: -1 });
RecurringSubscriptionSchema.index(
  { recurringRideId: 1, passengerId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [
          RecurringSubscriptionStatus.PENDING,
          RecurringSubscriptionStatus.APPROVED,
        ],
      },
    },
  },
);
