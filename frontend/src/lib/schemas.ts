import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const paymentSchema = z.object({
  name: z.string().min(1, 'Name on card is required'),
  cardNumber: z.string().min(16, 'Enter a valid card number'),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Format: MM/YY'),
  cvc: z.string().min(3, 'CVC must be 3-4 digits').max(4),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
