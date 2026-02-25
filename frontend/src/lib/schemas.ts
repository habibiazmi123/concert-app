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

// ─── Concert Schemas ─────────────────────────────────

const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.coerce.number().positive('Price must be positive'),
  totalSeats: z.coerce.number().int().positive('Must be at least 1'),
});

export const concertCreateSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  artist: z.string().min(1, 'Artist is required'),
  venue: z.string().min(1, 'Venue is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']),
  ticketTypes: z.array(ticketTypeSchema).min(1, 'At least one ticket type is required'),
});

export type ConcertCreateFormData = z.infer<typeof concertCreateSchema>;

export const concertEditSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  artist: z.string().min(1, 'Artist is required'),
  venue: z.string().min(1, 'Venue is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']),
});

export type ConcertEditFormData = z.infer<typeof concertEditSchema>;

