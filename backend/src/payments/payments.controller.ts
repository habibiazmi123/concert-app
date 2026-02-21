import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createPaymentSchema, CreatePaymentDto } from './dto/payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createPaymentSchema))
  async processPayment(
    @GetUser('id') userId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.processPayment(userId, dto);
  }

  @Get(':bookingId')
  async getPayment(
    @Param('bookingId') bookingId: string,
    @GetUser('id') userId: string,
  ) {
    return this.paymentsService.getPaymentByBookingId(bookingId, userId);
  }
}
