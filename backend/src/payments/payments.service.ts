import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly successRate: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.successRate = configService.get<number>('payment.successRate') || 0.9;
  }

  /**
   * Process a simulated payment for a booking.
   */
  async processPayment(userId: string, dto: CreatePaymentDto) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: dto.bookingId, userId },
      include: {
        payment: true,
        bookingItems: true,
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

    if (booking.payment) {
      throw new BadRequestException('Payment already exists for this booking');
    }

    if (new Date() > booking.expiresAt) {
      throw new BadRequestException(
        'Booking has expired. Please create a new booking.',
      );
    }

    // Simulate payment processing
    const isSuccess = Math.random() < this.successRate;
    const transactionId = uuidv4();

    if (isSuccess) {
      // Success: create payment and confirm booking
      const [payment] = await this.prisma.$transaction([
        this.prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: booking.totalAmount,
            method: dto.method,
            status: 'COMPLETED',
            transactionId,
            paidAt: new Date(),
          },
        }),
        this.prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'CONFIRMED' },
        }),
      ]);

      this.logger.log(
        `Payment successful: ${payment.id}, booking: ${booking.id}`,
      );

      return {
        payment,
        booking: {
          id: booking.id,
          status: 'CONFIRMED',
        },
        message: 'Payment processed successfully',
      };
    } else {
      // Failure: create failed payment, release seats
      const payment = await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          method: dto.method,
          status: 'FAILED',
          transactionId,
          failureReason: 'Payment declined by processor (simulated)',
        },
      });

      // Release seats
      await this.prisma.$transaction(async (tx) => {
        for (const item of booking.bookingItems) {
          await tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: {
              availableSeats: { increment: item.quantity },
            },
          });
        }

        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' },
        });
      });

      this.logger.warn(
        `Payment failed: ${payment.id}, booking: ${booking.id}`,
      );

      return {
        payment,
        booking: {
          id: booking.id,
          status: 'CANCELLED',
        },
        message: 'Payment failed. Booking has been cancelled.',
      };
    }
  }

  /**
   * Get payment status for a booking.
   */
  async getPaymentByBookingId(bookingId: string, userId?: string) {
    const where: any = { bookingId };

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
