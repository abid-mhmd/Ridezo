import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';
import type {
  CreateRideData,
  IRideRepository,
  ListRidesQuery,
  SearchRidesQuery,
  UpdateRideData,
} from '../../../domain/repositories/ride.repository';
import type { RideEntity } from '../../../domain/entities/ride.entity';
import { Ride, type RideDocument } from './ride.schema';
import { BaseMongooseRepository } from '../../../../../infrastructure/persistence/mongoose/base-mongoose.repository';
import type { AdminListRidesQuery } from '../../../domain/repositories/ride.repository';
import { RideStatus } from '../../../domain/enums/ride.enums';
import { User } from '../../../../users/infrastructure/persistence/mongoose/user.schema';
import { Vehicle } from '../../../../vehicles/infrastructure/persistence/mongoose/vehicle.schema';

const EARTH_RADIUS_KM = 6378.1;
const RIDE_SEARCH_RADIUS_KM = 10;

const SEARCH_RADIUS_IN_RADIANS = RIDE_SEARCH_RADIUS_KM / EARTH_RADIUS_KM;

@Injectable()
export class MongooseRideRepository
  extends BaseMongooseRepository<Ride>
  implements IRideRepository
{
  constructor(
    @InjectModel(Ride.name)
    model: Model<Ride>,
  ) {
    super(model);
  }

  async create(data: CreateRideData): Promise<RideEntity> {
    const ride = await this.createDocument({
      ...data,
      driverId: new Types.ObjectId(data.driverId),
      vehicleId: new Types.ObjectId(data.vehicleId),
    });

    return this.toEntity(ride);
  }

  async findById(rideId: string): Promise<RideEntity | null> {
    if (!Types.ObjectId.isValid(rideId)) {
      return null;
    }

    const ride = await this.model
      .findById(rideId)
      .populate({
        path: 'driverId',
        model: User.name,
        select:
          'firstName lastName profilePhoto phone  rating reviewCount completedRideCount identityVerification languages',
      })
      .populate({
        path: 'vehicleId',
        model: Vehicle.name,
        select:
          'brand model year color vehiclePhoto registrationNumber  verificationStatus',
      })
      .exec();

    return ride ? this.toEntity(ride) : null;
  }

  async findByDriverId(
    driverId: string,
    query: ListRidesQuery,
  ): Promise<{ rides: RideEntity[]; total: number }> {
    if (!Types.ObjectId.isValid(driverId)) {
      return {
        rides: [],
        total: 0,
      };
    }

    const driverObjectId = new Types.ObjectId(driverId);

    const skip = (query.page - 1) * query.limit;

    const [documents, total] = await Promise.all([
      this.model
        .find({ driverId: driverObjectId })
        .sort({ departureTime: -1, _id: -1 })
        .skip(skip)
        .limit(query.limit)
        .exec(),

      this.model
        .countDocuments({
          driverId: driverObjectId,
        })
        .exec(),
    ]);

    return {
      rides: documents.map((ride) => this.toEntity(ride)),
      total,
    };
  }

  async findAll(
    query: AdminListRidesQuery,
  ): Promise<{ rides: RideEntity[]; total: number }> {
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

    const [rides, total] = await Promise.all([
      this.model
        .find(filter)
        .populate({
          path: 'driverId',
          model: User.name,
          select:
            'firstName lastName profilePhoto rating reviewCount completedRideCount identityVerification languages',
        })
        .populate({
          path: 'vehicleId',
          model: Vehicle.name,
          select:
            'brand model year color vehiclePhoto registrationNumber verificationStatus',
        })
        .sort({ departureTime: -1 })
        .skip(skip)
        .limit(query.limit)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      rides: rides.map((ride) => this.toEntity(ride)),
      total,
    };
  }

  async update(
    rideId: string,
    driverId: string,
    data: UpdateRideData,
  ): Promise<RideEntity | null> {
    if (!Types.ObjectId.isValid(rideId) || !Types.ObjectId.isValid(driverId)) {
      return null;
    }

    const ride = await this.model
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(rideId),
          driverId: new Types.ObjectId(driverId),
          status: RideStatus.SCHEDULED,
        },
        {
          $set: data,
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    return ride ? this.toEntity(ride) : null;
  }

  async cancel(rideId: string, driverId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(rideId) || !Types.ObjectId.isValid(driverId)) {
      return false;
    }

    const result = await this.model
      .updateOne(
        {
          _id: new Types.ObjectId(rideId),
          driverId: new Types.ObjectId(driverId),
          status: {
            $in: [RideStatus.SCHEDULED, RideStatus.FULL],
          },
        },
        {
          $set: {
            status: RideStatus.CANCELLED,
          },
        },
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async cancelByAdmin(rideId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(rideId)) {
      return false;
    }

    const result = await this.model
      .updateOne(
        {
          _id: new Types.ObjectId(rideId),
          status: { $nin: [RideStatus.COMPLETED, RideStatus.CANCELLED] },
        },
        { $set: { status: RideStatus.CANCELLED } },
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async search(
    query: SearchRidesQuery,
    excludeDriverId?: string,
  ): Promise<{
    rides: RideEntity[];
    total: number;
  }> {
    const now = new Date();
    const dateStr = new Date(query.departureDate).toISOString().slice(0, 10);

    // Full day in IST (00:00:00 to 23:59:59.999 IST)
    const startOfDayIST = new Date(`${dateStr}T00:00:00.000+05:30`);
    const endOfDayIST = new Date(`${dateStr}T23:59:59.999+05:30`);

    const filter: Record<string, unknown> = {
      'origin.coordinates': {
        $geoWithin: {
          $centerSphere: [
            [query.originLongitude, query.originLatitude],
            SEARCH_RADIUS_IN_RADIANS,
          ],
        },
      },

      'destination.coordinates': {
        $geoWithin: {
          $centerSphere: [
            [query.destinationLongitude, query.destinationLatitude],
            SEARCH_RADIUS_IN_RADIANS,
          ],
        },
      },

      // Base departure date filter (IST)
      departureTime: {
        $gte: startOfDayIST > now ? startOfDayIST : now,
        $lte: endOfDayIST,
      },

      availableSeats: {
        $gte: query.seats,
      },

      status: RideStatus.SCHEDULED,
    };

    // Multi-select departure windows (IST: UTC+5:30)
    if (query.departureWindows && query.departureWindows.length > 0) {
      const windowConditions = query.departureWindows.map((win) => {
        let winStart = startOfDayIST;
        let winEnd = endOfDayIST;

        if (win === 'morning') {
          winStart = new Date(`${dateStr}T00:00:00.000+05:30`);
          winEnd = new Date(`${dateStr}T12:00:00.000+05:30`);
        } else if (win === 'afternoon') {
          winStart = new Date(`${dateStr}T12:00:00.000+05:30`);
          winEnd = new Date(`${dateStr}T18:00:00.000+05:30`);
        } else if (win === 'evening') {
          winStart = new Date(`${dateStr}T18:00:00.000+05:30`);
          winEnd = new Date(`${dateStr}T23:59:59.999+05:30`);
        }

        return {
          departureTime: {
            $gte: winStart > now ? winStart : now,
            $lt: winEnd,
          },
        };
      });

      delete filter.departureTime;
      filter.$or = windowConditions;
    }

    if (excludeDriverId && Types.ObjectId.isValid(excludeDriverId)) {
      filter.driverId = {
        $ne: new Types.ObjectId(excludeDriverId),
      };
    }

    // Optional price filtering
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};

      if (query.minPrice !== undefined) {
        priceFilter.$gte = query.minPrice;
      }

      if (query.maxPrice !== undefined) {
        priceFilter.$lte = query.maxPrice;
      }

      filter.pricePerSeat = priceFilter;
    }

    const skip = (query.page - 1) * query.limit;

    const sortQuery: Record<string, 1 | -1> =
      query.sortBy === 'price-low'
        ? { pricePerSeat: 1, departureTime: 1 }
        : query.sortBy === 'price-high'
          ? { pricePerSeat: -1, departureTime: 1 }
          : { departureTime: 1, _id: 1 };

    const [documents, total] = await Promise.all([
      this.model
        .find(filter)
        .populate({
          path: 'driverId',
          model: User.name,
          select:
            'firstName lastName profilePhoto phone rating reviewCount completedRideCount identityVerification languages',
        })
        .populate({
          path: 'vehicleId',
          model: Vehicle.name,
          select:
            'brand model year color vehiclePhoto registrationNumber verificationStatus',
        })
        .sort(sortQuery)
        .skip(skip)
        .limit(query.limit)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      rides: documents.map((ride) => this.toEntity(ride)),
      total,
    };
  }

  async reserveSeats(rideId: string, seats: number): Promise<boolean> {
    if (!Types.ObjectId.isValid(rideId) || seats < 1) {
      return false;
    }

    const updatedRide = await this.model
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(rideId),
          status: RideStatus.SCHEDULED,
          availableSeats: { $gte: seats },
        },
        [
          {
            $set: {
              availableSeats: { $subtract: ['$availableSeats', seats] },
              status: {
                $cond: [
                  { $eq: [{ $subtract: ['$availableSeats', seats] }, 0] },
                  RideStatus.FULL,
                  RideStatus.SCHEDULED,
                ],
              },
            },
          },
        ],
        { new: true, updatePipeline: true }, // <-- ADD updatePipeline: true
      )
      .exec();

    return updatedRide !== null;
  }

  async releaseSeats(rideId: string, seats: number): Promise<void> {
    if (!Types.ObjectId.isValid(rideId) || seats < 1) {
      return;
    }

    await this.model
      .updateOne(
        {
          _id: new Types.ObjectId(rideId),
          status: { $in: [RideStatus.SCHEDULED, RideStatus.FULL] },
        },
        [
          {
            $set: {
              availableSeats: {
                $min: ['$totalSeats', { $add: ['$availableSeats', seats] }],
              },
              status: RideStatus.SCHEDULED,
            },
          },
        ],
        { updatePipeline: true },
      )
      .exec();
  }

  private toEntity(ride: RideDocument): RideEntity {
    const driver = ride.populated('driverId')
      ? (ride.driverId as any)
      : undefined;

    const vehicle = ride.populated('vehicleId')
      ? (ride.vehicleId as any)
      : undefined;

    return {
      id: ride._id.toString(),
      driverId: driver
        ? driver._id.toString()
        : (ride.driverId?.toString() ?? ''),
      vehicleId: vehicle
        ? vehicle._id.toString()
        : (ride.vehicleId?.toString() ?? ''),

      ...(driver && {
        driver: {
          id: driver._id.toString(),
          firstName: driver.firstName,
          lastName: driver.lastName,
          phone: driver.phone,
          profilePhoto: driver.profilePhoto,
          rating: driver.rating,
          reviewCount: driver.reviewCount,
          completedRideCount: driver.completedRideCount,
          identityVerificationStatus: driver.identityVerification?.status ?? '',
          languages: driver.languages,
        },
      }),

      ...(vehicle && {
        vehicle: {
          id: vehicle._id.toString(),
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          color: vehicle.color,
          registrationNumber: vehicle.registrationNumber,
          vehiclePhoto: vehicle.vehiclePhoto,
          verificationStatus: vehicle.verificationStatus,
        },
      }),

      origin: ride.origin,
      destination: ride.destination,
      stops: ride.stops,
      departureTime: ride.departureTime,
      totalSeats: ride.totalSeats,
      availableSeats: ride.availableSeats,
      pricePerSeat: ride.pricePerSeat,
      preferences: {
        smoking: ride.preferences?.smoking,
        pets: ride.preferences?.pets,
        seatingComfort: ride.preferences?.seatingComfort,
        climateControl: ride.preferences?.climateControl,
      },
      pickupInstructions: ride.pickupInstructions,
      status: ride.status,
      createdAt: ride.createdAt,
      updatedAt: ride.updatedAt,
    };
  }
}
