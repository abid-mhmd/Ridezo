import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RIDE_REPOSITORY } from './domain/repositories/ride.repository';
import { MongooseRideRepository } from './infrastructure/persistence/mongoose/mongoose-ride.repository';
import {
  Ride,
  RideSchema,
} from './infrastructure/persistence/mongoose/ride.schema';
import { UsersModule } from '../users/users.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { CreateRideUseCase } from './application/use-cases/create-ride.use-case';
import { GetMyRidesUseCase } from './application/use-cases/get-my-rides.use-case';
import { GetRideDetailsUseCase } from './application/use-cases/get-ride-details.use-case';
import { UpdateRideUseCase } from './application/use-cases/update-ride.use-case';
import { CancelRideUseCase } from './application/use-cases/cancel-ride.use-case';
import { CREATE_RIDE_USE_CASE } from './application/interfaces/create-ride.use-case.interface';
import { GET_MY_RIDES_USE_CASE } from './application/interfaces/get-my-rides.use-case.interface';
import { GET_RIDE_DETAILS_USE_CASE } from './application/interfaces/get-ride-details.use-case';
import { UPDATE_RIDE_USE_CASE } from './application/interfaces/update-ride.use-case.interface';
import { CANCEL_RIDE_USE_CASE } from './application/interfaces/cancel-ride.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Ride.name,
        schema: RideSchema,
      },
    ]),
    UsersModule,
    VehiclesModule,
  ],
  providers: [
    {
      provide: RIDE_REPOSITORY,
      useClass: MongooseRideRepository,
    },
    {
      provide: CREATE_RIDE_USE_CASE,
      useClass: CreateRideUseCase,
    },
    {
      provide: GET_MY_RIDES_USE_CASE,
      useClass: GetMyRidesUseCase,
    },
    {
      provide: GET_RIDE_DETAILS_USE_CASE,
      useClass: GetRideDetailsUseCase,
    },
    {
      provide: UPDATE_RIDE_USE_CASE,
      useClass: UpdateRideUseCase,
    },
    {
      provide: CANCEL_RIDE_USE_CASE,
      useClass: CancelRideUseCase,
    },
  ],
  exports: [RIDE_REPOSITORY],
})
export class RidesModule {}
