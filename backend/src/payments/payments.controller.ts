import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createPaymentSchema, type CreatePaymentDto } from './dto/payment.dto';
import { CreatePaymentBody } from '../common/swagger/swagger.schemas';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Process a payment for a booking' })
  @ApiBody({ type: CreatePaymentBody })
  @ApiResponse({ status: 201, description: 'Payment processed' })
  @ApiResponse({ status: 400, description: 'Validation error or booking not payable' })
  async processPayment(
    @GetUser('id') userId: string,
    @Body(new ZodValidationPipe(createPaymentSchema)) dto: CreatePaymentDto,
  ) {
    return this.paymentsService.processPayment(userId, dto);
  }

  @Get(':bookingId')
  @ApiOperation({ summary: 'Get payment details by booking ID' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Payment details' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPayment(
    @Param('bookingId') bookingId: string,
    @GetUser('id') userId: string,
  ) {
    return this.paymentsService.getPaymentByBookingId(bookingId, userId);
  }
}
