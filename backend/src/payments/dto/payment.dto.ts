import { z } from 'zod';

export const createPaymentSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
});

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
