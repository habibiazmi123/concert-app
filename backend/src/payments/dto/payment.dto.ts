import { z } from 'zod';

export const createPaymentSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  method: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'E_WALLET']),
});

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
