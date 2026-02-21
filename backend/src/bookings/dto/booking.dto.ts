import { z } from 'zod';

export const bookingItemSchema = z.object({
  ticketTypeId: z.string().uuid('Invalid ticket type ID'),
  quantity: z.number().int().positive('Quantity must be at least 1').max(10, 'Maximum 10 tickets per type'),
});

export const createBookingSchema = z.object({
  concertId: z.string().uuid('Invalid concert ID'),
  items: z
    .array(bookingItemSchema)
    .min(1, 'At least one item is required')
    .max(5, 'Maximum 5 different ticket types per booking'),
});

export type CreateBookingDto = z.infer<typeof createBookingSchema>;

export const bookingQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED']).optional(),
});

export type BookingQueryDto = z.infer<typeof bookingQuerySchema>;
