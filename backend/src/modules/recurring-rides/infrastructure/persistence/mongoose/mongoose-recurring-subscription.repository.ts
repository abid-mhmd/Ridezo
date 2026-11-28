import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { BaseMongooseRepository } from '../../../../../infrastructure/persistence/mongoose/base-mongoose.repository';
import {
  RecurringSubscription,
  RecurringSubscriptionDocument,
} from './recurring-subscription.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  CreateRecurringSubscriptionData,
  IRecurringSubscriptionRepository,
} from '../../../domain/repositories/recurring-subscription.repository';
import { RecurringSubscriptionEntity } from '../../../domain/entities/recurring-subscription.entity';
import { RecurringSubscriptionStatus } from '../../../domain/enums/recurring-ride.enums';

@Injectable()
export class MongooseRecurringSubscriptionRepository
  extends BaseMongooseRepository<RecurringSubscription>
  implements IRecurringSubscriptionRepository
{
  constructor(
    @InjectModel(RecurringSubscription.name)
    model: Model<RecurringSubscription>,
  ) {
    super(model);
  }

  async create(
    data: CreateRecurringSubscriptionData,
  ): Promise<RecurringSubscriptionEntity> {
    const created = await this.createDocument({
      ...data,
      recurringRideId: new Types.ObjectId(data.recurringRideId),
      passengerId: new Types.ObjectId(data.passengerId),
      driverId: new Types.ObjectId(data.driverId),
    });

    const populated = await this.model
      .findById(created._id)
      .populate(this._getPassengerPopulate())
      .exec();

    return this._toEntity(
      (populated ?? created) as RecurringSubscriptionDocument,
    );
  }

  async findById(id: string): Promise<RecurringSubscriptionEntity | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await this.model
      .findById(id)
      .populate(this._getPassengerPopulate())
      .exec();

    return doc ? this._toEntity(doc as RecurringSubscriptionDocument) : null;
  }

  async findActiveByPassengerAndSchedule(
    passengerId: string,
    recurringRideId: string,
  ): Promise<RecurringSubscriptionEntity | null> {
    if (
      !Types.ObjectId.isValid(passengerId) ||
      !Types.ObjectId.isValid(recurringRideId)
    ) {
      return null;
    }

    const doc = await this.model
      .findOne({
        passengerId: new Types.ObjectId(passengerId),
        recurringRideId: new Types.ObjectId(recurringRideId),
        status: {
          $in: [
            RecurringSubscriptionStatus.PENDING,
            RecurringSubscriptionStatus.APPROVED,
          ],
        },
      })
      .populate(this._getPassengerPopulate())
      .exec();

    return doc ? this._toEntity(doc as RecurringSubscriptionDocument) : null;
  }

  async findByRecurringRideId(
    recurringRideId: string,
    status?: RecurringSubscriptionStatus,
  ): Promise<RecurringSubscriptionEntity[]> {
    if (!Types.ObjectId.isValid(recurringRideId)) {
      return [];
    }

    const filter: Record<string, unknown> = {
      recurringRideId: new Types.ObjectId(recurringRideId),
    };

    if (status) {
      filter.status = status;
    }

    const docs = await this.model
      .find(filter)
      .populate(this._getPassengerPopulate())
      .sort({ createdAt: -1 })
      .exec();

    return docs.map((doc) =>
      this._toEntity(doc as RecurringSubscriptionDocument),
    );
  }

  async findApprovedByRecurringRideAndDay(
    recurringRideId: string,
    dayOfWeek: number,
  ): Promise<RecurringSubscriptionEntity[]> {
    if (!Types.ObjectId.isValid(recurringRideId)) {
      return [];
    }

    const docs = await this.model
      .find({
        recurringRideId: new Types.ObjectId(recurringRideId),
        status: RecurringSubscriptionStatus.APPROVED,
        daysOfWeek: dayOfWeek,
      })
      .populate(this._getPassengerPopulate())
      .sort({ createdAt: 1 })
      .exec();

    return docs.map((doc) =>
      this._toEntity(doc as RecurringSubscriptionDocument),
    );
  }

  async findByPassengerId(
    passengerId: string,
  ): Promise<RecurringSubscriptionEntity[]> {
    if (!Types.ObjectId.isValid(passengerId)) {
      return [];
    }

    const docs = await this.model
      .find({ passengerId: new Types.ObjectId(passengerId) })
      .populate(this._getPassengerPopulate())
      .sort({ createdAt: -1 })
      .exec();

    return docs.map((doc) =>
      this._toEntity(doc as RecurringSubscriptionDocument),
    );
  }

  async updateStatus(
    id: string,
    status: RecurringSubscriptionStatus,
    rejectionReason?: string,
  ): Promise<RecurringSubscriptionEntity | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const updateFields: Record<string, unknown> = { status };
    if (rejectionReason !== undefined) {
      updateFields.rejectionReason = rejectionReason;
    }

    const updated = await this.model
      .findByIdAndUpdate(id, { $set: updateFields }, { new: true })
      .populate(this._getPassengerPopulate())
      .exec();

    return updated
      ? this._toEntity(updated as RecurringSubscriptionDocument)
      : null;
  }

  private _getPassengerPopulate() {
    return {
      path: 'passengerId',
      select:
        'firstName lastName email phone profilePhoto rating completedRideCount identityVerification',
    };
  }

  private _toEntity(
    doc: RecurringSubscriptionDocument,
  ): RecurringSubscriptionEntity {
    const passenger = doc.populated('passengerId')
      ? (doc.passengerId as unknown as Record<string, any>)
      : undefined;

    return {
      id: doc._id.toString(),
      recurringRideId: doc.recurringRideId.toString(),
      passengerId: passenger?._id
        ? passenger._id.toString()
        : doc.passengerId.toString(),
      driverId: doc.driverId.toString(),
      ...(passenger?._id && {
        passenger: {
          id: passenger._id.toString(),
          firstName: passenger.firstName ?? '',
          lastName: passenger.lastName ?? '',
          email: passenger.email ?? '',
          phone: passenger.phone ?? '',
          profilePhoto: passenger.profilePhoto ?? '',
          rating: passenger.rating ?? 0,
          completedRideCount: passenger.completedRideCount ?? 0,
          identityVerificationStatus:
            passenger.identityVerification?.status ?? '',
        },
      }),
      seatsRequested: doc.seatsRequested,
      daysOfWeek: doc.daysOfWeek ?? [],
      message: doc.message ?? '',
      rejectionReason: doc.rejectionReason ?? '',
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
