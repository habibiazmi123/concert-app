import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, BookingQueryDto } from './dto/booking.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
  private readonly redis: Redis;
  private readonly lockTtl: number;
  private readonly maxRetries: number;
  private readonly expirationMinutes: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @InjectQueue('booking') private bookingQueue: Queue,
  ) {
    this.redis = new Redis({
      host: configService.get<string>('redis.host'),
      port: configService.get<number>('redis.port'),
    });
    this.lockTtl = configService.get<number>('booking.lockTtlSeconds') || 5;
    this.maxRetries = configService.get<number>('booking.maxRetries') || 3;
    this.expirationMinutes =
      configService.get<number>('booking.expirationMinutes') || 10;
  }

  /**
   * Enqueue a booking request into BullMQ.
   * Returns a queue job with position info.
   */
  async enqueueBooking(userId: string, dto: CreateBookingDto) {
    // Validate concert exists and is published
    const concert = await this.prisma.concert.findUnique({
      where: { id: dto.concertId },
      include: { ticketTypes: true },
    });

    if (!concert) {
      throw new NotFoundException('Concert not found');
    }

    if (concert.status !== 'PUBLISHED') {
      throw new BadRequestException('Concert is not available for booking');
    }

    if (new Date(concert.date) < new Date()) {
      throw new BadRequestException('Concert has already passed');
    }

    // Validate ticket types exist for this concert
    for (const item of dto.items) {
      const ticketType = concert.ticketTypes.find(
        (tt) => tt.id === item.ticketTypeId,
      );
      if (!ticketType) {
        throw new NotFoundException(
          `Ticket type ${item.ticketTypeId} not found for this concert`,
        );
      }
      if (ticketType.availableSeats < item.quantity) {
        throw new ConflictException(
          `Not enough seats available for ${ticketType.name}. Available: ${ticketType.availableSeats}`,
        );
      }
    }

    // Create queue job record
    const queueJob = await this.prisma.queueJob.create({
      data: {
        userId,
        concertId: dto.concertId,
        status: 'WAITING',
        jobData: dto as any,
      },
    });

    // Add to BullMQ
    const job = await this.bookingQueue.add(
      'process-booking',
      {
        queueJobId: queueJob.id,
        userId,
        concertId: dto.concertId,
        items: dto.items,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: false,
        removeOnFail: false,
      },
    );

    this.logger.log(
      `Booking enqueued: job=${job.id}, queueJob=${queueJob.id}, user=${userId}`,
    );

    // Calculate approximate position
    const waitingCount = await this.bookingQueue.getWaitingCount();

    return {
      queueJobId: queueJob.id,
      bullJobId: job.id,
      position: waitingCount,
      status: 'WAITING',
      message: 'Your booking request has been queued',
    };
  }

  /**
   * Process a booking — called by the BullMQ worker.
   * Acquires distributed lock, validates seats, creates booking atomically.
   */
  async processBooking(data: {
    queueJobId: string;
    userId: string;
    concertId: string;
    items: Array<{ ticketTypeId: string; quantity: number }>;
  }) {
    const { queueJobId, userId, concertId, items } = data;

    // Update queue job to PROCESSING
    await this.prisma.queueJob.update({
      where: { id: queueJobId },
      data: { status: 'PROCESSING' },
    });

    // Acquire distributed locks for all ticket types
    const lockKeys = items.map(
      (item) => `lock:ticket_type:${item.ticketTypeId}`,
    );
    const lockValues: string[] = [];

    try {
      // Acquire all locks
      for (const lockKey of lockKeys) {
        const lockValue = `${queueJobId}:${Date.now()}`;
        const acquired = await this.acquireLock(lockKey, lockValue);
        if (!acquired) {
          // Release already acquired locks
          for (let i = 0; i < lockValues.length; i++) {
            await this.releaseLock(lockKeys[i], lockValues[i]);
          }
          throw new ConflictException(
            'Unable to acquire seat lock. Please try again.',
          );
        }
        lockValues.push(lockValue);
      }

      // Execute atomic transaction
      const booking = await this.prisma.$transaction(async (tx) => {
        // Verify seat availability inside transaction
        let totalAmount = new Decimal(0);
        const bookingItemsData: Array<{
          ticketTypeId: string;
          quantity: number;
          unitPrice: Decimal;
          subtotal: Decimal;
        }> = [];

        for (const item of items) {
          const ticketType = await tx.ticketType.findUnique({
            where: { id: item.ticketTypeId },
          });

          if (!ticketType) {
            throw new NotFoundException(`Ticket type ${item.ticketTypeId} not found`);
          }

          if (ticketType.availableSeats < item.quantity) {
            throw new ConflictException(
              `Not enough seats for ${ticketType.name}. Available: ${ticketType.availableSeats}`,
            );
          }

          // Decrement available seats atomically
          await tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: {
              availableSeats: {
                decrement: item.quantity,
              },
            },
          });

          const subtotal = ticketType.price.mul(item.quantity);
          totalAmount = totalAmount.add(subtotal);

          bookingItemsData.push({
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity,
            unitPrice: ticketType.price,
            subtotal,
          });
        }

        // Create booking
        const expiresAt = new Date(
          Date.now() + this.expirationMinutes * 60 * 1000,
        );

        const booking = await tx.booking.create({
          data: {
            userId,
            concertId,
            status: 'PENDING',
            totalAmount,
            expiresAt,
            bookingItems: {
              create: bookingItemsData,
            },
          },
          include: {
            bookingItems: {
              include: {
                ticketType: true,
              },
            },
            concert: {
              select: {
                title: true,
                venue: true,
                date: true,
              },
            },
          },
        });

        return booking;
      });

      // Update queue job
      await this.prisma.queueJob.update({
        where: { id: queueJobId },
        data: {
          status: 'COMPLETED',
          bookingId: booking.id,
          processedAt: new Date(),
        },
      });

      // Schedule expiration job
      await this.bookingQueue.add(
        'expire-booking',
        { bookingId: booking.id },
        {
          delay: this.expirationMinutes * 60 * 1000,
          removeOnComplete: true,
        },
      );

      this.logger.log(
        `Booking created: ${booking.id}, total: ${booking.totalAmount}`,
      );

      return booking;
    } catch (error) {
      // Update queue job to FAILED
      await this.prisma.queueJob.update({
        where: { id: queueJobId },
        data: {
          status: 'FAILED',
          errorMsg: error?.message || 'Unknown error',
          processedAt: new Date(),
        },
      });
      throw error;
    } finally {
      // Release all locks
      for (let i = 0; i < lockValues.length; i++) {
        await this.releaseLock(lockKeys[i], lockValues[i]);
      }
    }
  }

  /**
   * Expire a pending booking and release seats.
   */
  async expireBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { bookingItems: true },
    });

    if (!booking || booking.status !== 'PENDING') {
      return; // Already processed
    }

    await this.prisma.$transaction(async (tx) => {
      // Release seats
      for (const item of booking.bookingItems) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: {
            availableSeats: {
              increment: item.quantity,
            },
          },
        });
      }

      // Mark booking as expired
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'EXPIRED' },
      });
    });

    this.logger.log(`Booking expired and seats released: ${bookingId}`);
  }

  /**
   * Get queue status for a specific job.
   */
  async getQueueStatus(queueJobId: string) {
    const queueJob = await this.prisma.queueJob.findUnique({
      where: { id: queueJobId },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!queueJob) {
      throw new NotFoundException('Queue job not found');
    }

    // Estimate position if still waiting
    let position: number | null = null;
    if (queueJob.status === 'WAITING') {
      const waitingBefore = await this.prisma.queueJob.count({
        where: {
          status: 'WAITING',
          createdAt: { lt: queueJob.createdAt },
        },
      });
      position = waitingBefore + 1;
    }

    return {
      ...queueJob,
      position,
    };
  }

  /**
   * Get user's bookings with pagination.
   */
  async getUserBookings(userId: string, query: BookingQueryDto) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          concert: {
            select: {
              title: true,
              venue: true,
              date: true,
              imageUrl: true,
            },
          },
          bookingItems: {
            include: {
              ticketType: {
                select: { name: true },
              },
            },
          },
          payment: {
            select: {
              status: true,
              paidAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a specific booking by ID.
   */
  async getBookingById(bookingId: string, userId?: string) {
    const where: any = { id: bookingId };
    if (userId) {
      where.userId = userId;
    }

    const booking = await this.prisma.booking.findFirst({
      where,
      include: {
        concert: true,
        bookingItems: {
          include: { ticketType: true },
        },
        payment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  /**
   * Cancel a booking and release seats.
   */
  async cancelBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: { bookingItems: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
      throw new BadRequestException('Booking is already cancelled or expired');
    }

    if (booking.status === 'CONFIRMED') {
      throw new BadRequestException(
        'Cannot cancel a confirmed booking. Please request a refund.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // Release seats
      for (const item of booking.bookingItems) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: {
            availableSeats: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });
    });

    this.logger.log(`Booking cancelled: ${bookingId}`);
    return { message: 'Booking cancelled successfully' };
  }

  // ─── Redis Lock Helpers ────────────────────────────

  private async acquireLock(
    key: string,
    value: string,
  ): Promise<boolean> {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const result = await this.redis.set(key, value, 'EX', this.lockTtl, 'NX');
      if (result === 'OK') {
        return true;
      }
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
    }
    return false;
  }

  private async releaseLock(key: string, value: string): Promise<void> {
    // Use Lua script for atomic check-and-delete
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await this.redis.eval(script, 1, key, value);
  }
}
