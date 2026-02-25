import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { BookingsService } from './bookings.service';
import { AdminGateway } from '../admin/admin.gateway';
import { PrismaService } from '../prisma/prisma.service';

@Processor('booking', {
  concurrency: 5,
  limiter: {
    max: 100,
    duration: 1000,
  },
})
export class BookingProcessor extends WorkerHost {
  private readonly logger = new Logger(BookingProcessor.name);
  private readonly processDelayMs: number;

  constructor(
    private readonly bookingsService: BookingsService,
    private readonly configService: ConfigService,
    private readonly adminGateway: AdminGateway,
    private readonly prisma: PrismaService,
  ) {
    super();
    this.processDelayMs =
      this.configService.get<number>('booking.processDelayMs') ?? 0;

    if (this.processDelayMs > 0) {
      this.logger.warn(
        `⚠️  DEV MODE: ${this.processDelayMs}ms artificial delay per booking. Set BOOKING_PROCESS_DELAY_MS=0 in production.`,
      );
    }
  }

  async process(job: Job): Promise<any> {
    this.logger.log(
      `Processing job ${job.id} (${job.name}): ${JSON.stringify(job.data)}`,
    );

    switch (job.name) {
      case 'process-booking':
        return this.handleProcessBooking(job);
      case 'expire-booking':
        return this.handleExpireBooking(job);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async handleProcessBooking(job: Job) {
    // Emit PROCESSING status
    this.adminGateway.emitQueueUpdate({
      jobId: job.data.queueJobId,
      status: 'PROCESSING',
      userId: job.data.userId,
      concertId: job.data.concertId,
    });

    try {
      // DEV ONLY: Simulate processing delay
      if (this.processDelayMs > 0) {
        this.logger.log(
          `⏳ DEV: Simulating ${this.processDelayMs}ms delay for job ${job.id}`,
        );
        await new Promise((resolve) => setTimeout(resolve, this.processDelayMs));
      }

      const booking = await this.bookingsService.processBooking(job.data);
      this.logger.log(
        `Booking processed successfully: ${booking.id} for job ${job.id}`,
      );

      // Emit COMPLETED status
      this.adminGateway.emitQueueUpdate({
        jobId: job.data.queueJobId,
        status: 'COMPLETED',
        bookingId: booking.id,
        userId: job.data.userId,
        concertId: job.data.concertId,
      });

      // Emit updated counts
      await this.emitCounts();

      return { bookingId: booking.id, status: 'COMPLETED' };
    } catch (error) {
      this.logger.error(
        `Booking processing failed for job ${job.id}: ${error.message}`,
      );

      // Emit FAILED status
      this.adminGateway.emitQueueUpdate({
        jobId: job.data.queueJobId,
        status: 'FAILED',
        error: error.message,
        userId: job.data.userId,
        concertId: job.data.concertId,
      });

      await this.emitCounts();
      throw error;
    }
  }

  private async handleExpireBooking(job: Job) {
    try {
      await this.bookingsService.expireBooking(job.data.bookingId);
      this.logger.log(
        `Booking expired: ${job.data.bookingId} for job ${job.id}`,
      );
      return { bookingId: job.data.bookingId, status: 'EXPIRED' };
    } catch (error) {
      this.logger.error(
        `Booking expiration failed for ${job.data.bookingId}: ${error.message}`,
      );
      throw error;
    }
  }

  private async emitCounts() {
    const [waiting, processing, completed, failed] = await Promise.all([
      this.prisma.queueJob.count({ where: { status: 'WAITING' } }),
      this.prisma.queueJob.count({ where: { status: 'PROCESSING' } }),
      this.prisma.queueJob.count({ where: { status: 'COMPLETED' } }),
      this.prisma.queueJob.count({ where: { status: 'FAILED' } }),
    ]);
    this.adminGateway.emitQueueCounts({ waiting, processing, completed, failed });
  }
}
