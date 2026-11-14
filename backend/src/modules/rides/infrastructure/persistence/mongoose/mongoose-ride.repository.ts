import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';

import type {
  CreateRideData,
  IRideRepository,
  ListRidesQuery,
  UpdateRideData,
} from '../../../domain/repositories/ride.repository';
import type { RideEntity } from '../../../domain/entities/ride.entity';
import { Ride, type RideDocument } from './ride.schema';
import { BaseMongooseRepository } from '../../../../../infrastructure/persistence/mongoose/base-mongoose.repository';
import { RideStatus } from '../../../domain/enums/ride.enums';

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

    const ride = await this.findDocumentById(rideId);

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

  private toEntity(ride: RideDocument): RideEntity {
    return {
      id: ride._id.toString(),
      driverId: ride.driverId.toString(),
      vehicleId: ride.vehicleId.toString(),
      origin: ride.origin,
      destination: ride.destination,
      stops: ride.stops,
      departureTime: ride.departureTime,
      totalSeats: ride.totalSeats,
      availableSeats: ride.availableSeats,
      pricePerSeat: ride.pricePerSeat,
      preferences: ride.preferences,
      pickupInstructions: ride.pickupInstructions,
      status: ride.status,
      createdAt: ride.createdAt,
      updatedAt: ride.updatedAt,
    };
  }
}
