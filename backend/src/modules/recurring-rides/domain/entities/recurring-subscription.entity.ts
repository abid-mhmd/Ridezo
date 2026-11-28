import type { RecurringSubscriptionStatus } from '../enums/recurring-ride.enums';

export interface RecurringPassengerSummary {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  profilePhoto: string;
  rating: number;
  completedRideCount: number;
  identityVerificationStatus: string;
}

export interface RecurringSubscriptionEntity {
  id: string;
  recurringRideId: string;
  passengerId: string;
  driverId: string;
  passenger?: RecurringPassengerSummary;
  seatsRequested: number;
  daysOfWeek: number[];
  message?: string;
  rejectionReason?: string;
  status: RecurringSubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}
