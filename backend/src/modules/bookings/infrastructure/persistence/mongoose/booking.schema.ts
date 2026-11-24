import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BookingStatus } from '../../../domain/enums/booking.enums';
import type {
  BookingDriverSnapshot,
  BookingVehicleSnapshot,
  BookingRideSnapshot,
} from '../../../domain/entities/booking.entity';

export type BookingDocument = HydratedDocument<Booking>;
@Schema({ _id: false })
class BookingSnapshotCoordinates {
  @Prop({
    type: String,
    enum: ['Point'],
    required: true,
  })
  type: 'Point';

  @Prop({
    type: [Number],
    required: true,
  })
  coordinates: [number, number];
}

const BookingSnapshotCoordinatesSchema = SchemaFactory.createForClass(
  BookingSnapshotCoordinates,
);

@Schema({ _id: false })
class BookingSnapshotLocation {
  @Prop({ type: String, required: true })
  placeId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({
    type: BookingSnapshotCoordinatesSchema,
    required: true,
  })
  coordinates: BookingSnapshotCoordinates;
}

const BookingSnapshotLocationSchema = SchemaFactory.createForClass(
  BookingSnapshotLocation,
);

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

  @Prop({
    type: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      profilePhoto: { type: String, default: '' },
    },
    required: true,
    _id: false,
  })
  driverSnapshot: BookingDriverSnapshot;

  @Prop({
    type: {
      brand: { type: String, required: true },
      model: { type: String, required: true },
      year: { type: Number, required: true },
      color: { type: String, required: true },
      registrationNumber: { type: String, required: true },
      vehiclePhoto: { type: String, default: '' },
    },
    required: true,
    _id: false,
  })
  vehicleSnapshot: BookingVehicleSnapshot;
  @Prop({
    type: {
      origin: {
        type: BookingSnapshotLocationSchema,
        required: true,
      },
      destination: {
        type: BookingSnapshotLocationSchema,
        required: true,
      },
      stops: {
        type: [BookingSnapshotLocationSchema],
        default: [],
      },
      departureTime: {
        type: Date,
        required: true,
      },
      pickupInstructions: {
        type: String,
        default: '',
      },
    },
    required: true,
    _id: false,
  })
  rideSnapshot: BookingRideSnapshot;

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
