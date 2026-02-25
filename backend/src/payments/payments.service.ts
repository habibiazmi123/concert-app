import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { SnapService } from '../midtrans/snap.service';
import { MidtransService } from '../midtrans/midtrans.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private snapService: SnapService,
    private midtransService: MidtransService,
  ) {}

  /**
   * Process a payment by generating a Midtrans Snap Token.
   */
  async processPayment(userId: string, dto: CreatePaymentDto) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: dto.bookingId, userId },
      include: {
        payment: true,
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot process payment for booking with status: ${booking.status}`,
      );
    }

    // Checking expiry if needed
    if (new Date() > booking.expiresAt) {
      throw new BadRequestException(
        'Booking has expired. Please create a new booking.',
      );
    }

    // Call SnapService to generate token
    const { token, redirectUrl } = await this.snapService.createTransactionToken({
      orderId: booking.id,
      grossAmount: Number(booking.totalAmount),
      customerDetails: {
        firstName: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone || undefined,
      },
    });

    return {
      snapToken: token,
      redirectUrl,
      booking: {
        id: booking.id,
        status: booking.status,
      },
      message: 'Payment token generated successfully',
    };
  }

  /**
   * Handle webhook notification from Midtrans
   */
  async handleNotification(body: any) {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
    } = body;

    // 1. Verify Signature using MidtransService
    const isValidSignature = this.midtransService.verifySignature(
      order_id,
      status_code,
      gross_amount,
      signature_key,
    );

    if (!isValidSignature) {
      this.logger.warn(`Invalid signature for order: ${order_id}`);
      throw new BadRequestException('Invalid signature');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: order_id },
      include: { bookingItems: true },
    });

    if (!booking) {
      this.logger.warn(`Booking not found for order: ${order_id}`);
      return { status: 'ok', message: 'Booking not found' };
    }

    // 2. Map Payment Method
    let method: any = 'E_WALLET';
    if (payment_type === 'credit_card') method = 'CREDIT_CARD';
    else if (payment_type === 'bank_transfer') method = 'BANK_TRANSFER';
    else if (payment_type?.includes('debit')) method = 'DEBIT_CARD';

    // 3. Determine Payment & Booking Status
    let paymentStatus: any = 'PENDING';
    let bookingStatus: any = booking.status;
    let isFailed = false;

    if (
      transaction_status === 'capture' ||
      transaction_status === 'settlement'
    ) {
      if (transaction_status === 'capture' && fraud_status === 'challenge') {
        paymentStatus = 'PENDING';
      } else {
        paymentStatus = 'COMPLETED';
        bookingStatus = 'CONFIRMED';
      }
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'expire'
    ) {
      paymentStatus = 'FAILED';
      bookingStatus = 'CANCELLED';
      isFailed = true;
    }

    // 4. Update Database
    await this.prisma.$transaction(async (tx) => {
      // Upsert payment record
      await tx.payment.upsert({
        where: { bookingId: order_id },
        update: {
          status: paymentStatus,
          transactionId: transaction_id,
          method,
          ...(paymentStatus === 'COMPLETED' ? { paidAt: new Date() } : {}),
        },
        create: {
          bookingId: order_id,
          amount: booking.totalAmount,
          status: paymentStatus,
          transactionId: transaction_id,
          method,
          ...(paymentStatus === 'COMPLETED' ? { paidAt: new Date() } : {}),
        },
      });

      // Update booking status if changed
      if (booking.status !== bookingStatus) {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: bookingStatus },
        });

        // Release seats if failed and it was previously not cancelled
        if (isFailed && booking.status !== 'CANCELLED') {
          for (const item of booking.bookingItems) {
            await tx.ticketType.update({
              where: { id: item.ticketTypeId },
              data: {
                availableSeats: { increment: item.quantity },
              },
            });
          }
        }
      }
    });

    this.logger.log(`Handled webhook for booking ${order_id}, status: ${paymentStatus}`);
    return { status: 'ok' };
  }

  /**
   * Get payment status for a booking.
   */
  async getPaymentByBookingId(bookingId: string, userId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          select: {
            id: true,
            userId: true,
            status: true,
            totalAmount: true,
            concert: {
              select: {
                title: true,
                venue: true,
                date: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (userId && payment.booking.userId !== userId) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
