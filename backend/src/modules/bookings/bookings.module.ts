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
  ],
  exports: [BOOKING_REPOSITORY],
})
export class BookingsModule {}
