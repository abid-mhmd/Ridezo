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
          'firstName lastName profilePhoto  rating reviewCount completedRideCount identityVerification languages',
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

  async search(
    query: SearchRidesQuery,
    excludeDriverId?: string,
  ): Promise<{
    rides: RideEntity[];
    total: number;
  }> {
    const startOfDay = new Date(query.departureDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const startOfNextDay = new Date(startOfDay);
    startOfNextDay.setUTCDate(startOfNextDay.getUTCDate() + 1);

    const now = new Date();

    const filter: Record<string, unknown> = {
      // Origin must be within 10 km
      'origin.coordinates': {
        $geoWithin: {
          $centerSphere: [
            [query.originLongitude, query.originLatitude],
            SEARCH_RADIUS_IN_RADIANS,
          ],
        },
      },

      // Destination must also be within 10 km
      'destination.coordinates': {
        $geoWithin: {
          $centerSphere: [
            [query.destinationLongitude, query.destinationLatitude],
            SEARCH_RADIUS_IN_RADIANS,
          ],
        },
      },

      // Departure date
      departureTime: {
        $gte: startOfDay > now ? startOfDay : now,
        $lt: startOfNextDay,
      },

      // Available seats
      availableSeats: {
        $gte: query.seats,
      },

      // Only scheduled rides
      status: RideStatus.SCHEDULED,
    };

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

    const [documents, total] = await Promise.all([
      this.model
        .find(filter)
        .populate({
          path: 'driverId',
          model: User.name,
          select:
            'firstName lastName profilePhoto profilePhoto  rating reviewCount completedRideCount identityVerification languages',
        })
        .populate({
          path: 'vehicleId',
          model: Vehicle.name,
          select:
            'brand model year color vehiclePhoto registrationNumber  vehiclePhoto  verificationStatus',
        })
        .sort({ departureTime: 1, _id: 1 })
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

  private toEntity(ride: RideDocument): RideEntity {
    const driver = ride.populated('driverId')
      ? (ride.driverId as any)
      : undefined;

    const vehicle = ride.populated('vehicleId')
      ? (ride.vehicleId as any)
      : undefined;

    return {
      id: ride._id.toString(),
      driverId: driver ? driver._id.toString() : ride.driverId.toString(),
      vehicleId: vehicle ? vehicle._id.toString() : ride.vehicleId.toString(),

      ...(driver && {
        driver: {
          id: driver._id.toString(),
          firstName: driver.firstName,
          lastName: driver.lastName,
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
