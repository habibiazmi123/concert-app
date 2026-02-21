import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BookingsService } from './bookings.service';

@Processor('booking', {
  concurrency: 5,
  limiter: {
    max: 50,
    duration: 1000,
  },
})
export class BookingProcessor extends WorkerHost {
  private readonly logger = new Logger(BookingProcessor.name);

  constructor(private readonly bookingsService: BookingsService) {
    super();
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
    try {
      const booking = await this.bookingsService.processBooking(job.data);
      this.logger.log(
        `Booking processed successfully: ${booking.id} for job ${job.id}`,
      );
      return { bookingId: booking.id, status: 'COMPLETED' };
    } catch (error) {
      this.logger.error(
        `Booking processing failed for job ${job.id}: ${error.message}`,
      );
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
}
