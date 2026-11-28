import {  Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { RecurringRideEntity } from '../../../domain/entities/recurring-ride.entity';
import { RecurringRideStatus } from '../../../domain/enums/recurring-ride.enums';
import type {
  CreateRecurringRideData,
  IRecurringRideRepository,
  ListRecurringRidesQuery,
  UpdateRecurringRideData,
} from '../../../domain/repositories/recurring-ride.repository';
import {
  RecurringRide,
  type RecurringRideDocument,
} from './recurring-ride.schema';
import { BaseMongooseRepository } from '../../../../../infrastructure/persistence/mongoose/base-mongoose.repository';

@Injectable()
export class MongooseRecurringRideRepository
  extends BaseMongooseRepository<RecurringRide>
  implements IRecurringRideRepository
{
  constructor(
    @InjectModel(RecurringRide.name)
    model: Model<RecurringRide>,
  ) {
    super(model);
  }

  async create(data: CreateRecurringRideData): Promise<RecurringRideEntity> {
    const created = await this.createDocument({
      ...data,
      driverId: new Types.ObjectId(data.driverId),
      vehicleId: new Types.ObjectId(data.vehicleId),
    });

    const populated = await this.model
      .findById(created._id)
      .populate(this._getDriverPopulate())
      .populate(this._getVehiclePopulate())
      .exec();

    return this._toEntity((populated ?? created) as RecurringRideDocument);
  }

  async findById(id: string): Promise<RecurringRideEntity | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await this.model
      .findById(id)
      .populate(this._getDriverPopulate())
      .populate(this._getVehiclePopulate())
      .exec();

    return doc ? this._toEntity(doc) : null;
  }

  async findByDriverId(
    driverId: string,
    query: ListRecurringRidesQuery,
  ): Promise<{ schedules: RecurringRideEntity[]; total: number }> {
    const filter: Record<string, unknown> = {
      driverId: new Types.ObjectId(driverId),
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search?.trim()) {
      const escaped = query.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { 'origin.name': regex },
        { 'origin.address': regex },
        { 'destination.name': regex },
        { 'destination.address': regex },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [docs, total] = await Promise.all([
      this.model
        .find(filter)
        .populate(this._getDriverPopulate())
        .populate(this._getVehiclePopulate())
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      schedules: docs.map((doc) => this._toEntity(doc)),
      total,
    };
  }

  async findAll(
    query: ListRecurringRidesQuery,
  ): Promise<{ schedules: RecurringRideEntity[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search?.trim()) {
      const escaped = query.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { 'origin.name': regex },
        { 'origin.address': regex },
        { 'destination.name': regex },
        { 'destination.address': regex },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [docs, total] = await Promise.all([
      this.model
        .find(filter)
        .populate(this._getDriverPopulate())
        .populate(this._getVehiclePopulate())
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      schedules: docs.map((doc) => this._toEntity(doc)),
      total,
    };
  }

  async findActiveForGeneration(
    referenceDate: Date,
  ): Promise<RecurringRideEntity[]> {
    const docs = await this.model
      .find({
        status: RecurringRideStatus.ACTIVE,
        $or: [{ endDate: null }, { endDate: { $gte: referenceDate } }],
      })
      .populate(this._getDriverPopulate())
      .populate(this._getVehiclePopulate())
      .exec();

    return docs.map((doc) => this._toEntity(doc));
  }

  async update(
    id: string,
    driverId: string,
    data: UpdateRecurringRideData,
  ): Promise<RecurringRideEntity | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const updated = await this.model
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          driverId: new Types.ObjectId(driverId),
        },
        { $set: data },
        { new: true },
      )
      .populate(this._getDriverPopulate())
      .populate(this._getVehiclePopulate())
      .exec();

    return updated ? this._toEntity(updated) : null;
  }

  async updateStatus(
    id: string,
    driverId: string,
    status: RecurringRideStatus,
  ): Promise<RecurringRideEntity | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const updated = await this.model
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          driverId: new Types.ObjectId(driverId),
        },
        { $set: { status } },
        { new: true },
      )
      .populate(this._getDriverPopulate())
      .populate(this._getVehiclePopulate())
      .exec();

    return updated ? this._toEntity(updated) : null;
  }

  async updateStatusByAdmin(
    id: string,
    status: RecurringRideStatus,
  ): Promise<RecurringRideEntity | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const updated = await this.model
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .populate(this._getDriverPopulate())
      .populate(this._getVehiclePopulate())
      .exec();

    return updated ? this._toEntity(updated) : null;
  }

  async updateLastGeneratedDate(id: string, date: Date): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      return;
    }

    await this.model
      .updateOne(
        { _id: new Types.ObjectId(id) },
        { $set: { lastGeneratedDate: date } },
      )
      .exec();
  }

  private _getDriverPopulate() {
    return {
      path: 'driverId',
      select:
        'firstName lastName profilePhoto rating reviewCount completedRideCount identityVerification languages',
    };
  }

  private _getVehiclePopulate() {
    return {
      path: 'vehicleId',
      select:
        'brand model year color registrationNumber vehiclePhoto verificationStatus',
    };
  }

  private _toEntity(doc: RecurringRideDocument): RecurringRideEntity {
    const driver = doc.populated('driverId')
      ? (doc.driverId as unknown as Record<string, any>)
      : undefined;
    const vehicle = doc.populated('vehicleId')
      ? (doc.vehicleId as unknown as Record<string, any>)
      : undefined;

    return {
      id: doc._id.toString(),
      driverId: driver?._id ? driver._id.toString() : doc.driverId.toString(),
      vehicleId: vehicle?._id
        ? vehicle._id.toString()
        : doc.vehicleId.toString(),
      ...(driver?._id && {
        driver: {
          id: driver._id.toString(),
          firstName: driver.firstName ?? '',
          lastName: driver.lastName ?? '',
          profilePhoto: driver.profilePhoto ?? '',
          rating: driver.rating ?? 0,
          reviewCount: driver.reviewCount ?? 0,
          completedRideCount: driver.completedRideCount ?? 0,
          identityVerificationStatus: driver.identityVerification?.status ?? '',
          languages: driver.languages ?? [],
        },
      }),
      ...(vehicle?._id && {
        vehicle: {
          id: vehicle._id.toString(),
          brand: vehicle.brand ?? '',
          model: vehicle.model ?? '',
          year: vehicle.year ?? 0,
          color: vehicle.color ?? '',
          registrationNumber: vehicle.registrationNumber ?? '',
          vehiclePhoto: vehicle.vehiclePhoto ?? '',
          verificationStatus: vehicle.verificationStatus ?? '',
        },
      }),
      origin: doc.origin,
      destination: doc.destination,
      stops: doc.stops ?? [],
      daysOfWeek: doc.daysOfWeek ?? [],
      departureTime: doc.departureTime,
      timezone: doc.timezone,
      startDate: doc.startDate,
      endDate: doc.endDate ?? null,
      totalSeats: doc.totalSeats,
      pricePerSeat: doc.pricePerSeat,
      preferences: {
        smoking: doc.preferences?.smoking,
        pets: doc.preferences?.pets,
        seatingComfort: doc.preferences?.seatingComfort,
        climateControl: doc.preferences?.climateControl,
      },
      pickupInstructions: doc.pickupInstructions ?? '',
      generateAheadDays: doc.generateAheadDays,
      lastGeneratedDate: doc.lastGeneratedDate ?? null,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
