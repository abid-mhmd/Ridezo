import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BookingStatus } from '../../../domain/enums/booking.enums';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({
  timestamps: true,
  collection: 'bookings',
})
export class Booking {
  @Prop({
    type: Types.ObjectId,
    ref: 'Ride',
    required: true,
  })
  rideId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  passengerId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  driverId: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
    min: 1,
  })
  seatsRequested: number;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  pricePerSeat: number;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  totalPrice: number;

  @Prop({
    type: String,
    trim: true,
  })
  message?: string;

  @Prop({
    type: String,
    trim: true,
  })
  rejectionReason?: string;

  @Prop({
    type: String,
    enum: BookingStatus,
    default: BookingStatus.PENDING,
    required: true,
  })
  status: BookingStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index({ passengerId: 1, createdAt: -1 });
BookingSchema.index({ driverId: 1, createdAt: -1 });
BookingSchema.index({ rideId: 1, passengerId: 1, status: 1 });
BookingSchema.index({ status: 1, createdAt: -1 });
