import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingProcessor } from './booking.processor';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    AdminModule,
    BullModule.registerQueue({
      name: 'booking',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingProcessor],
  exports: [BookingsService],
})
export class BookingsModule {}

