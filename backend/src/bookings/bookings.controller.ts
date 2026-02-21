import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  createBookingSchema,
  bookingQuerySchema,
  CreateBookingDto,
  BookingQueryDto,
} from './dto/booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createBookingSchema))
  async createBooking(
    @GetUser('id') userId: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.enqueueBooking(userId, dto);
  }

  @Get('queue-status/:queueJobId')
  async getQueueStatus(@Param('queueJobId') queueJobId: string) {
    return this.bookingsService.getQueueStatus(queueJobId);
  }

  @Get('my')
  async getMyBookings(
    @GetUser('id') userId: string,
    @Query(new ZodValidationPipe(bookingQuerySchema)) query: BookingQueryDto,
  ) {
    return this.bookingsService.getUserBookings(userId, query);
  }

  @Get(':id')
  async getBooking(
    @Param('id') bookingId: string,
    @GetUser('id') userId: string,
  ) {
    return this.bookingsService.getBookingById(bookingId, userId);
  }

  @Post(':id/cancel')
  async cancelBooking(
    @Param('id') bookingId: string,
    @GetUser('id') userId: string,
  ) {
    return this.bookingsService.cancelBooking(bookingId, userId);
  }
}
