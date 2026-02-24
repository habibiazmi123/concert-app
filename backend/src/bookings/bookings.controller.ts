import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from  '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  createBookingSchema,
  bookingQuerySchema,
  type CreateBookingDto,
  type BookingQueryDto,
} from './dto/booking.dto';
import { CreateBookingBody } from '../common/swagger/swagger.schemas';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking (enqueue)' })
  @ApiBody({ type: CreateBookingBody })
  @ApiResponse({ status: 201, description: 'Booking enqueued — returns queue job ID' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createBooking(
    @GetUser('id') userId: string,
    @Body(new ZodValidationPipe(createBookingSchema)) dto: CreateBookingDto,
  ) {
    return this.bookingsService.enqueueBooking(userId, dto);
  }

  @Get('queue-status/:queueJobId')
  @ApiOperation({ summary: 'Check booking queue status' })
  @ApiParam({ name: 'queueJobId', description: 'Queue job ID returned from booking creation' })
  @ApiResponse({ status: 200, description: 'Queue job status' })
  async getQueueStatus(@Param('queueJobId') queueJobId: string) {
    return this.bookingsService.getQueueStatus(queueJobId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'] })
  @ApiResponse({ status: 200, description: 'List of user bookings' })
  async getMyBookings(
    @GetUser('id') userId: string,
    @Query(new ZodValidationPipe(bookingQuerySchema)) query: BookingQueryDto,
  ) {
    return this.bookingsService.getUserBookings(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking details' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBooking(
    @Param('id') bookingId: string,
    @GetUser('id') userId: string,
  ) {
    return this.bookingsService.getBookingById(bookingId, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 201, description: 'Booking cancelled' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancelBooking(
    @Param('id') bookingId: string,
    @GetUser('id') userId: string,
  ) {
    return this.bookingsService.cancelBooking(bookingId, userId);
  }
}
