import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';
import type {
  CreateBookingData,
  IBookingRepository,
  ListBookingsQuery,
  UpdateBookingStatusData,
} from '../../../domain/repositories/booking.repository';
import type { BookingEntity } from '../../../domain/entities/booking.entity';
import { BookingStatus } from '../../../domain/enums/booking.enums';
import { Booking, type BookingDocument } from './booking.schema';
import { BaseMongooseRepository } from '../../../../../infrastructure/persistence/mongoose/base-mongoose.repository';

@Injectable()
export class MongooseBookingRepository
  extends BaseMongooseRepository<Booking>
  implements IBookingRepository
{
  constructor(
    @InjectModel(Booking.name)
    model: Model<Booking>,
  ) {
    super(model);
  }

  async create(data: CreateBookingData): Promise<BookingEntity> {
    const booking = await this.createDocument({
      ...data,
      rideId: new Types.ObjectId(data.rideId),
      passengerId: new Types.ObjectId(data.passengerId),
      driverId: new Types.ObjectId(data.driverId),
    });

    return this.toEntity(booking);
  }

  async findById(bookingId: string): Promise<BookingEntity | null> {
    if (!Types.ObjectId.isValid(bookingId)) {
      return null;
    }

    const booking = await this.findDocumentById(bookingId);

    return booking ? this.toEntity(booking) : null;
  }

  async findActiveByPassengerAndRide(
    passengerId: string,
    rideId: string,
  ): Promise<BookingEntity | null> {
    if (
      !Types.ObjectId.isValid(passengerId) ||
      !Types.ObjectId.isValid(rideId)
    ) {
      return null;
    }

    const booking = await this.model
      .findOne({
        passengerId: new Types.ObjectId(passengerId),
        rideId: new Types.ObjectId(rideId),
        status: {
          $in: [BookingStatus.PENDING, BookingStatus.ACCEPTED],
        },
      })
      .exec();

    return booking ? this.toEntity(booking) : null;
  }

  async findByPassengerId(
    passengerId: string,
    query: ListBookingsQuery,
  ): Promise<{ bookings: BookingEntity[]; total: number }> {
    if (!Types.ObjectId.isValid(passengerId)) {
      return {
        bookings: [],
        total: 0,
      };
    }

    const passengerObjectId = new Types.ObjectId(passengerId);
    const skip = (query.page - 1) * query.limit;

    const [documents, total] = await Promise.all([
      this.model
        .find({ passengerId: passengerObjectId })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(query.limit)
        .exec(),

      this.model.countDocuments({ passengerId: passengerObjectId }).exec(),
    ]);

    return {
      bookings: documents.map((booking) => this.toEntity(booking)),
      total,
    };
  }

  async findByDriverId(
    driverId: string,
    query: ListBookingsQuery,
  ): Promise<{ bookings: BookingEntity[]; total: number }> {
    if (!Types.ObjectId.isValid(driverId)) {
      return {
        bookings: [],
        total: 0,
      };
    }

    const driverObjectId = new Types.ObjectId(driverId);
    const skip = (query.page - 1) * query.limit;

    const [documents, total] = await Promise.all([
      this.model
        .find({ driverId: driverObjectId })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(query.limit)
        .exec(),

      this.model.countDocuments({ driverId: driverObjectId }).exec(),
    ]);

    return {
      bookings: documents.map((booking) => this.toEntity(booking)),
      total,
    };
  }

  async updateStatus(
    bookingId: string,
    expectedStatus: BookingStatus,
    data: UpdateBookingStatusData,
  ): Promise<BookingEntity | null> {
    if (!Types.ObjectId.isValid(bookingId)) {
      return null;
    }

    const booking = await this.model
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(bookingId),
          status: expectedStatus,
        },
        {
          $set: {
            status: data.status,
            ...(data.rejectionReason !== undefined && {
              rejectionReason: data.rejectionReason,
            }),
          },
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    return booking ? this.toEntity(booking) : null;
  }

  private toEntity(booking: BookingDocument): BookingEntity {
    return {
      id: booking._id.toString(),
      rideId: booking.rideId.toString(),
      passengerId: booking.passengerId.toString(),
      driverId: booking.driverId.toString(),
      seatsRequested: booking.seatsRequested,
      pricePerSeat: booking.pricePerSeat,
      totalPrice: booking.totalPrice,
      message: booking.message,
      rejectionReason: booking.rejectionReason,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
