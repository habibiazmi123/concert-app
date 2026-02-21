import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  createConcertSchema,
  updateConcertSchema,
  addTicketTypeSchema,
  updateTicketTypeSchema,
  concertQuerySchema,
  CreateConcertDto,
  UpdateConcertDto,
  AddTicketTypeDto,
  UpdateTicketTypeDto,
  ConcertQueryDto,
} from './dto/concert.dto';

@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  // ─── Public Endpoints ──────────────────────────────

  @Get()
  async findAllPublished(
    @Query(new ZodValidationPipe(concertQuerySchema)) query: ConcertQueryDto,
  ) {
    return this.concertsService.findAllPublished(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.concertsService.findById(id);
  }

  // ─── Admin Endpoints ──────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UsePipes(new ZodValidationPipe(createConcertSchema))
  async create(@Body() dto: CreateConcertDto) {
    return this.concertsService.create(dto);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAll(
    @Query(new ZodValidationPipe(concertQuerySchema)) query: ConcertQueryDto,
  ) {
    return this.concertsService.findAll(query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UsePipes(new ZodValidationPipe(updateConcertSchema))
  async update(@Param('id') id: string, @Body() dto: UpdateConcertDto) {
    return this.concertsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async delete(@Param('id') id: string) {
    return this.concertsService.delete(id);
  }

  // ─── Ticket Type Management ───────────────────────

  @Post(':id/ticket-types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UsePipes(new ZodValidationPipe(addTicketTypeSchema))
  async addTicketType(
    @Param('id') concertId: string,
    @Body() dto: AddTicketTypeDto,
  ) {
    return this.concertsService.addTicketType(concertId, dto);
  }

  @Patch('ticket-types/:ticketTypeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UsePipes(new ZodValidationPipe(updateTicketTypeSchema))
  async updateTicketType(
    @Param('ticketTypeId') ticketTypeId: string,
    @Body() dto: UpdateTicketTypeDto,
  ) {
    return this.concertsService.updateTicketType(ticketTypeId, dto);
  }

  @Delete('ticket-types/:ticketTypeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteTicketType(@Param('ticketTypeId') ticketTypeId: string) {
    return this.concertsService.deleteTicketType(ticketTypeId);
  }
}
