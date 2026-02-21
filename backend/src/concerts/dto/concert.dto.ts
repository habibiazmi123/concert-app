import { z } from 'zod';

export const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  totalSeats: z.number().int().positive('Total seats must be positive'),
  sortOrder: z.number().int().min(0).optional(),
});

export const createConcertSchema = z.object({
  title: z.string().min(2, 'Title is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  artist: z.string().min(1, 'Artist is required').max(200),
  venue: z.string().min(1, 'Venue is required').max(200),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  date: z.string().datetime('Invalid date format'),
  imageUrl: z.string().url().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
  ticketTypes: z.array(ticketTypeSchema).min(1, 'At least one ticket type is required'),
});

export type CreateConcertDto = z.infer<typeof createConcertSchema>;

export const updateConcertSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().min(10).optional(),
  artist: z.string().min(1).max(200).optional(),
  venue: z.string().min(1).max(200).optional(),
  address: z.string().min(1).max(500).optional(),
  city: z.string().min(1).max(100).optional(),
  date: z.string().datetime().optional(),
  imageUrl: z.string().url().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
});

export type UpdateConcertDto = z.infer<typeof updateConcertSchema>;

export const addTicketTypeSchema = ticketTypeSchema;
export type AddTicketTypeDto = z.infer<typeof ticketTypeSchema>;

export const updateTicketTypeSchema = ticketTypeSchema.partial();
export type UpdateTicketTypeDto = z.infer<typeof updateTicketTypeSchema>;

export const concertQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
  search: z.string().optional(),
  city: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
  sortBy: z.enum(['date', 'title', 'createdAt']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type ConcertQueryDto = z.infer<typeof concertQuerySchema>;
