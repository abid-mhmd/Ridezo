import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';

import type {
  CreateVehicleData,
  IVehicleRepository,
  UpdateVehicleData,
} from '../../../domain/repositories/vehicle.repository.js';
import type { VehicleEntity } from '../../../domain/entities/vehicle.entity.js';
import { Vehicle, type VehicleDocument } from './vehicle.schema.js';
import { BaseMongooseRepository } from '../../../../../infrastructure/persistence/mongoose/base-mongoose.repository.js';

@Injectable()
export class MongooseVehicleRepository
  extends BaseMongooseRepository<Vehicle>
  implements IVehicleRepository
{
  constructor(
    @InjectModel(Vehicle.name)
    model: Model<Vehicle>,
  ) {
    super(model);
  }

  async create(data: CreateVehicleData): Promise<VehicleEntity> {
    const vehicle = await this.createDocument({
      ...data,
      ownerId: new Types.ObjectId(data.ownerId),
    });
    return this.toEntity(vehicle);
  }

  async findByIdAndOwner(
    vehicleId: string,
    ownerId: string,
  ): Promise<VehicleEntity | null> {
    if (
      !Types.ObjectId.isValid(vehicleId) ||
      !Types.ObjectId.isValid(ownerId)
    ) {
      return null;
    }
    const vehicleObjectId = new Types.ObjectId(vehicleId);
    const ownerObjectId = new Types.ObjectId(ownerId);

    const vehicle = await this.model
      .findOne({ _id: vehicleObjectId, ownerId: ownerObjectId })
      .exec();

    return vehicle ? this.toEntity(vehicle) : null;
  }

  async findByOwnerId(ownerId: string): Promise<VehicleEntity[]> {
    if (!Types.ObjectId.isValid(ownerId)) {
      return [];
    }
    const vehicleOwnerId = new Types.ObjectId(ownerId);

    const vehicle = await this.model
      .find({ ownerId: vehicleOwnerId, isActive: true })
      .sort({ createdAt: -1 })
      .exec();

    return vehicle.map((vehicle) => this.toEntity(vehicle));
  }

  async update(
    vehicleId: string,
    ownerId: string,
    data: UpdateVehicleData,
  ): Promise<VehicleEntity | null> {
    if (
      !Types.ObjectId.isValid(vehicleId) ||
      !Types.ObjectId.isValid(ownerId)
    ) {
      return null;
    }

    const vehicleObjectId = new Types.ObjectId(vehicleId);
    const ownerObjectId = new Types.ObjectId(ownerId);

    const vehicle = await this.model
      .findOneAndUpdate(
        { _id: vehicleObjectId, ownerId: ownerObjectId, isActive: true },
        { $set: data },
        { new: true, runValidators: true },
      )
      .exec();

    return vehicle ? this.toEntity(vehicle) : null;
  }

  async deactivate(vehicleId: string, ownerId: string): Promise<boolean> {
    if (
      !Types.ObjectId.isValid(vehicleId) ||
      !Types.ObjectId.isValid(ownerId)
    ) {
      return false;
    }

    const vehicleObjectId = new Types.ObjectId(vehicleId);
    const ownerObjectId = new Types.ObjectId(ownerId);

    const result = await this.model
      .updateOne(
        { _id: vehicleObjectId, ownerId: ownerObjectId },
        { $set: { isActive: false } },
      )
      .exec();

    return result.matchedCount > 0;
  }

  async existsByRegistrationNumber(
    registrationNumber: string,
    excludeVehicleId?: string,
  ): Promise<boolean> {
    const filter: Record<string, unknown> = {
      registrationNumber,
    };

    if (excludeVehicleId && Types.ObjectId.isValid(excludeVehicleId)) {
      filter._id = { $ne: new Types.ObjectId(excludeVehicleId) };
    }
    const vehicle = await this.model.exists(filter).exec();
    return vehicle !== null;
  }

  private toEntity(vehicle: VehicleDocument): VehicleEntity {
    return {
      id: vehicle._id.toString(),
      ownerId: vehicle.ownerId.toString(),

      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      registrationNumber: vehicle.registrationNumber,
      seatCapacity: vehicle.seatCapacity,
      fuelType: vehicle.fuelType,
      vehiclePhoto: vehicle.vehiclePhoto,
      verificationStatus: vehicle.verificationStatus,
      isActive: vehicle.isActive,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }
}
