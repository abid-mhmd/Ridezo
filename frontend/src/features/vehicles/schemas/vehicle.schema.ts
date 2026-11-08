import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const vehicleSchema = z.object({
  vehicleType: z.enum(['hatchback', 'sedan', 'suv', 'muv', 'van']),

  brand: z
    .string()
    .trim()
    .min(1, 'Brand is required.')
    .max(50, 'Brand must not exceed 50 characters.'),

  model: z
    .string()
    .trim()
    .min(1, 'Model is required.')
    .max(50, 'Model must not exceed 50 characters.'),

  year: z
    .number()
    .int('Year must be a whole number.')
    .min(1900, 'Year must be 1900 or later.')
    .max(currentYear + 1, `Year cannot exceed ${currentYear + 1}.`),

  color: z
    .string()
    .trim()
    .min(1, 'Color is required.')
    .max(30, 'Color must not exceed 30 characters.'),

  registrationNumber: z
    .string()
    .trim()
    .min(1, 'Registration number is required.')
    .max(20, 'Registration number must not exceed 20 characters.'),

  seatCapacity: z
    .number()
    .int('Seat capacity must be a whole number.')
    .min(1, 'At least one seat is required.')
    .max(8, 'Seat capacity cannot exceed 8.'),

  fuelType: z.enum(['petrol', 'diesel', 'cng', 'electric', 'hybrid']),

  vehiclePhoto: z
    .string()
    .url('Enter a valid image URL.')
    .optional()
    .or(z.literal('')),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;
