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

  async findAll(
    query: ListBookingsQuery,
  ): Promise<{ bookings: BookingEntity[]; total: number }> {
    const skip = (query.page - 1) * query.limit;
    const filter: Record<string, unknown> = {};

    if (query.search?.trim()) {
      const escapedSearch = query.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const searchRegex = new RegExp(escapedSearch, 'i');

      const orConditions: Record<string, unknown>[] = [
        { 'driverSnapshot.firstName': searchRegex },
        { 'driverSnapshot.lastName': searchRegex },
        { 'rideSnapshot.origin.name': searchRegex },
        { 'rideSnapshot.destination.name': searchRegex },
        { 'vehicleSnapshot.brand': searchRegex },
        { 'vehicleSnapshot.model': searchRegex },
        { 'vehicleSnapshot.registrationNumber': searchRegex },
        { status: searchRegex },
      ];

      const validPassengerIds = (query.passengerIds ?? [])
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));

      if (validPassengerIds.length > 0) {
        orConditions.push({ passengerId: { $in: validPassengerIds } });
      }

      filter.$or = orConditions;
    }

    const [documents, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(query.limit)
        .exec(),

      this.model.countDocuments(filter).exec(),
    ]);

    return {
      bookings: documents.map((booking) => this.toEntity(booking)),
      total,
    };
  }

  private toEntity(booking: BookingDocument): BookingEntity {
    const plain = booking.toObject();

    return {
      id: booking._id.toString(),
      rideId: booking.rideId.toString(),
      passengerId: booking.passengerId.toString(),
      driverId: booking.driverId.toString(),
      seatsRequested: plain.seatsRequested,
      pricePerSeat: plain.pricePerSeat,
      totalPrice: plain.totalPrice,

      driverSnapshot: {
        firstName: plain.driverSnapshot?.firstName ?? '',
        lastName: plain.driverSnapshot?.lastName ?? '',
        profilePhoto: plain.driverSnapshot?.profilePhoto ?? '',
      },
      vehicleSnapshot: {
        brand: plain.vehicleSnapshot?.brand ?? '',
        model: plain.vehicleSnapshot?.model ?? '',
        year: plain.vehicleSnapshot?.year ?? 0,
        color: plain.vehicleSnapshot?.color ?? '',
        registrationNumber: plain.vehicleSnapshot?.registrationNumber ?? '',
        vehiclePhoto: plain.vehicleSnapshot?.vehiclePhoto ?? '',
      },
      rideSnapshot: {
        origin: plain.rideSnapshot.origin,
        destination: plain.rideSnapshot.destination,
        stops: plain.rideSnapshot.stops ?? [],
        departureTime: plain.rideSnapshot.departureTime,
        pickupInstructions: plain.rideSnapshot.pickupInstructions ?? '',
      },

      message: plain.message,
      rejectionReason: plain.rejectionReason,
      status: plain.status,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }
}
