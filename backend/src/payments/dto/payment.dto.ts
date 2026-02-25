import { z } from 'zod';

export const createPaymentSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  paymentType: z.enum(['credit_card', 'bank_transfer', 'gopay', 'shopeepay', 'dana', 'ovo']).default('credit_card'),
  tokenId: z.string().optional(),
  bank: z.string().optional(),
});

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
