import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { SecurityModule } from '../../infrastructure/redis/security/security.module';
import { AdminAuthController } from './presentation/admin-auth.controller';
import { AdminLoginUseCase } from './application/use-cases/admin-login.use-case';
import { AdminUsersController } from './presentation/admin-users.controller';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { AdminRoleGuard } from './presentation/guards/admin-role.guard';
import { GetUserDetailsUseCase } from './application/use-cases/get-user-detail.user-case';
import { ChangeUserAccountStatusUseCase } from './application/use-cases/change-user-account-status.use-case';
import { RefreshAdminTokenUseCase } from './application/use-cases/refresh-admin-token.use-case';
import { AdminLogoutUseCase } from './application/use-cases/admin-logout.use-case';
import { ADMIN_LOGIN_USE_CASE } from './application/interfaces/admin-login.use-case.interface';
import { ADMIN_LOGOUT_USE_CASE } from './application/interfaces/admin-logout.use-case.interface';
import { REFRESH_ADMIN_TOKEN_USE_CASE } from './application/interfaces/refresh-admin-token.use-case.interface';
import { LIST_USERS_USE_CASE } from './application/interfaces/list-users.use-case.interface';
import { GET_USER_DETAILS_USE_CASE } from './application/interfaces/get-user-details.use-case.interface';
import { CHANGE_USER_ACCOUNT_STATUS_USE_CASE } from './application/interfaces/change-user-account-status.use-case.interface';
import { BookingsModule } from '../bookings/bookings.module';
import { AdminBookingsController } from './presentation/admin-bookings.controller';
import { LIST_ADMIN_BOOKINGS_USE_CASE } from './application/interfaces/list-admin-booking.use-case.interface';
import { ListAdminBookingsUseCase } from './application/use-cases/list-admin-booking.use-case';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { LIST_ADMIN_VEHICLES_USE_CASE } from './application/interfaces/list-admin-vehicles.use-case.interface';
import { ListAdminVehiclesUseCase } from './application/use-cases/list-admin-vehicles.user-case';
import { GET_ADMIN_VEHICLE_DETAILS_USE_CASE } from './application/interfaces/get-admin-vehicle-details.use-case.interface';
import { GetAdminVehicleDetailsUseCase } from './application/use-cases/get-admin-vehicle-details.use-case';
import { AdminVehiclesController } from './presentation/admin-vehicles.controller';
import { REVIEW_ADMIN_VEHICLE_DOCUMENT_USE_CASE } from './application/interfaces/review-admin-vehicle-document.use-case.interface';
import { ReviewAdminVehicleDocumentUseCase } from './application/use-cases/review-admin-vehicle-document.use-case';
import { UPDATE_ADMIN_VEHICLE_STATUS_USE_CASE } from './application/interfaces/update.admin-vehicle.status.use-case.interface';
import { UpdateAdminVehicleStatusUseCase } from './application/use-cases/update-admin-vehicle-status.use-case';
import { LIST_ADMIN_RIDES_USE_CASE } from './application/interfaces/list-admin-rides.use-case.interface';
import { ListAdminRidesUseCase } from './application/use-cases/list-admin-rides.use-case';
import { GET_ADMIN_RIDE_DETAILS_USE_CASE } from './application/interfaces/get-admin-ride-details.use-case.interface';
import { GetAdminRideDetailsUseCase } from './application/use-cases/get-admin-ride-details.use-case';
import { CANCEL_ADMIN_RIDE_USE_CASE } from './application/interfaces/cancel-admin-ride.use-case.interface';
import { CancelAdminRideUseCase } from './application/use-cases/cancel-admin-ride.use-case';
import { RidesModule } from '../rides/rides.module';
import { AdminRidesController } from './presentation/admin-rides.controller';
import { REVIEW_USER_IDENTITY_USE_CASE } from './application/interfaces/review-user-identity.use-case.interface';
import { ReviewUserIdentityUseCase } from './application/use-cases/review-user-identity.use-case';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    RidesModule,
    BookingsModule,
    VehiclesModule,
    SecurityModule,
  ],
  controllers: [
    AdminAuthController,
    AdminUsersController,
    AdminRidesController,
    AdminBookingsController,
    AdminVehiclesController,
  ],
  providers: [
    {
      provide: ADMIN_LOGIN_USE_CASE,
      useClass: AdminLoginUseCase,
    },
    {
      provide: REFRESH_ADMIN_TOKEN_USE_CASE,
      useClass: RefreshAdminTokenUseCase,
    },
    {
      provide: LIST_USERS_USE_CASE,
      useClass: ListUsersUseCase,
    },
    AdminRoleGuard,
    {
      provide: GET_USER_DETAILS_USE_CASE,
      useClass: GetUserDetailsUseCase,
    },
    {
      provide: CHANGE_USER_ACCOUNT_STATUS_USE_CASE,
      useClass: ChangeUserAccountStatusUseCase,
    },
    {
      provide: ADMIN_LOGOUT_USE_CASE,
      useClass: AdminLogoutUseCase,
    },
    {
      provide: LIST_ADMIN_RIDES_USE_CASE,
      useClass: ListAdminRidesUseCase,
    },
    {
      provide: GET_ADMIN_RIDE_DETAILS_USE_CASE,
      useClass: GetAdminRideDetailsUseCase,
    },
    {
      provide: CANCEL_ADMIN_RIDE_USE_CASE,
      useClass: CancelAdminRideUseCase,
    },
    {
      provide: LIST_ADMIN_BOOKINGS_USE_CASE,
      useClass: ListAdminBookingsUseCase,
    },
    {
      provide: LIST_ADMIN_VEHICLES_USE_CASE,
      useClass: ListAdminVehiclesUseCase,
    },
    {
      provide: GET_ADMIN_VEHICLE_DETAILS_USE_CASE,
      useClass: GetAdminVehicleDetailsUseCase,
    },
    {
      provide: REVIEW_ADMIN_VEHICLE_DOCUMENT_USE_CASE,
      useClass: ReviewAdminVehicleDocumentUseCase,
    },
    {
      provide: UPDATE_ADMIN_VEHICLE_STATUS_USE_CASE,
      useClass: UpdateAdminVehicleStatusUseCase,
    },
    {
      provide: REVIEW_USER_IDENTITY_USE_CASE,
      useClass: ReviewUserIdentityUseCase,
    },
  ],
})
export class AdminAuthModule {}
