import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BOOKING_REPOSITORY } from './domain/repositories/booking.repository';
import { MongooseBookingRepository } from './infrastructure/persistence/mongoose/mongoose.booking.repostiory';
import {
  Booking,
  BookingSchema,
} from './infrastructure/persistence/mongoose/booking.schema';
import { SecurityModule } from '../../infrastructure/redis/security/security.module';
import { UsersModule } from '../users/users.module';
import { CREATE_BOOKING_USE_CASE } from './application/interfaces/create-booking.use-case.inteface';
import { CreateBookingUseCase } from './application/use-cases/create-booking.use-case';
import { RidesModule } from '../rides/rides.module';
import { BookingsController } from './presentation/bookings.controller';
import { GET_BOOKINGS_FOR_USER_USE_CASE } from './application/interfaces/get-my-bookings-for-user.use-case.interface';
import { GetBookingsForUserUseCase } from './application/use-cases/get-bookings-for-user.use-case';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { GET_BOOKING_BY_ID_USE_CASE } from './application/interfaces/get-booking-by-id.use-case.interface';
import { GetBookingByIdUseCase } from './application/use-cases/get-booking-by-id.use-case';
import { CANCEL_BOOKING_USE_CASE } from './application/interfaces/cancel-booking.use-case.interface';
import { CancelBookingUseCase } from './application/use-cases/cancel.booking.use-case';
import { RESPOND_TO_BOOKING_REQUEST_USE_CASE } from './application/interfaces/respond-to-booking-request.use-case.interface';
import { RespondToBookingRequestUseCase } from './application/use-cases/respond-to-booking-request.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Booking.name,
        schema: BookingSchema,
      },
    ]),
    RidesModule,
    UsersModule,
    VehiclesModule,
    SecurityModule,
  ],
  controllers: [BookingsController],
  providers: [
    {
      provide: BOOKING_REPOSITORY,
      useClass: MongooseBookingRepository,
    },
    {
      provide: CREATE_BOOKING_USE_CASE,
      useClass: CreateBookingUseCase,
    },
    {
      provide: GET_BOOKINGS_FOR_USER_USE_CASE,
      useClass: GetBookingsForUserUseCase,
    },
    {
      provide: GET_BOOKING_BY_ID_USE_CASE,
      useClass: GetBookingByIdUseCase,
    },
    {
      provide: CANCEL_BOOKING_USE_CASE,
      useClass: CancelBookingUseCase,
    },
    {
      provide: RESPOND_TO_BOOKING_REQUEST_USE_CASE,
      useClass: RespondToBookingRequestUseCase,
    },
  ],
  exports: [BOOKING_REPOSITORY],
})
export class BookingsModule {}
