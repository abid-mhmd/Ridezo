import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.')
    .max(254, 'Email address is too long.'),

  password: z
    .string()
    .min(1, 'Password is required.')
    .max(128, 'Password must not exceed 128 characters.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'First name is required.')
      .max(50, 'First name must not exceed 50 characters.'),

    lastName: z
      .string()
      .trim()
      .min(1, 'Last name is required.')
      .max(50, 'Last name must not exceed 50 characters.'),

    email: z
      .string()
      .trim()
      .min(1, 'Email is required.')
      .email('Enter a valid email address.')
      .max(254, 'Email address is too long.'),

    password: z
      .string()
      .min(8, 'Password must contain at least 8 characters.')
      .max(128, 'Password must not exceed 128 characters.'),

    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
