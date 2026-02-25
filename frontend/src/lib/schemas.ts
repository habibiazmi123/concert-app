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
  paymentMethod: z.enum(['credit_card', 'bank_transfer']),
  bankCode: z.string().optional(),
  name: z.string().optional(),
  cardNumber: z.string().optional(),
  expiryMonth: z.string().optional(),
  expiryYear: z.string().optional(),
  cvv: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === 'credit_card') {
    if (!data.name?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Name on card is required', path: ['name'] });
    }
    if (!/^\d{16}$/.test(data.cardNumber || '')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid 16-digit card number', path: ['cardNumber'] });
    }
    if (!/^(0[1-9]|1[0-2])$/.test(data.expiryMonth || '')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid month (01–12)', path: ['expiryMonth'] });
    }
    if (!/^\d{4}$/.test(data.expiryYear || '')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid 4-digit year', path: ['expiryYear'] });
    }
    if (!/^\d{3,4}$/.test(data.cvv || '')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CVV must be 3–4 digits', path: ['cvv'] });
    }
  } else if (data.paymentMethod === 'bank_transfer') {
    if (!data.bankCode?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a bank', path: ['bankCode'] });
    }
  }
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

