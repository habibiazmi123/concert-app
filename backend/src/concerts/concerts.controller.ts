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
  type CreateConcertDto,
  type UpdateConcertDto,
  type AddTicketTypeDto,
  type UpdateTicketTypeDto,
  type ConcertQueryDto,
} from './dto/concert.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateConcertBody,
  UpdateConcertBody,
  TicketTypeBody,
  UpdateTicketTypeBody,
} from '../common/swagger/swagger.schemas';

@ApiTags('Concerts')
@ApiBearerAuth()
@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  // ─── Public Endpoints ──────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List published concerts' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['date', 'title', 'createdAt'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'List of published concerts' })
  async findAllPublished(
    @Query(new ZodValidationPipe(concertQuerySchema)) query: ConcertQueryDto,
  ) {
    return this.concertsService.findAllPublished(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get concert by ID' })
  @ApiParam({ name: 'id', description: 'Concert ID' })
  @ApiResponse({ status: 200, description: 'Concert details' })
  @ApiResponse({ status: 404, description: 'Concert not found' })
  async findById(@Param('id') id: string) {
    return this.concertsService.findById(id);
  }

  // ─── Admin Endpoints ──────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new concert (Admin)' })
  @ApiBody({ type: CreateConcertBody })
  @ApiResponse({ status: 201, description: 'Concert created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin only' })
  @UsePipes(new ZodValidationPipe(createConcertSchema))
  async create(@Body() dto: CreateConcertDto) {
    return this.concertsService.create(dto);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all concerts including drafts (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'] })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['date', 'title', 'createdAt'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'List of all concerts' })
  async findAll(
    @Query(new ZodValidationPipe(concertQuerySchema)) query: ConcertQueryDto,
  ) {
    return this.concertsService.findAll(query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a concert (Admin)' })
  @ApiParam({ name: 'id', description: 'Concert ID' })
  @ApiBody({ type: UpdateConcertBody })
  @ApiResponse({ status: 200, description: 'Concert updated' })
  @ApiResponse({ status: 404, description: 'Concert not found' })
  @UsePipes(new ZodValidationPipe(updateConcertSchema))
  async update(@Param('id') id: string, @Body() dto: UpdateConcertDto) {
    return this.concertsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a concert (Admin)' })
  @ApiParam({ name: 'id', description: 'Concert ID' })
  @ApiResponse({ status: 200, description: 'Concert deleted' })
  @ApiResponse({ status: 404, description: 'Concert not found' })
  async delete(@Param('id') id: string) {
    return this.concertsService.delete(id);
  }

  // ─── Ticket Type Management ───────────────────────

  @Post(':id/ticket-types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Add a ticket type to a concert (Admin)' })
  @ApiParam({ name: 'id', description: 'Concert ID' })
  @ApiBody({ type: TicketTypeBody })
  @ApiResponse({ status: 201, description: 'Ticket type added' })
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
  @ApiOperation({ summary: 'Update a ticket type (Admin)' })
  @ApiParam({ name: 'ticketTypeId', description: 'Ticket Type ID' })
  @ApiBody({ type: UpdateTicketTypeBody })
  @ApiResponse({ status: 200, description: 'Ticket type updated' })
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
  @ApiOperation({ summary: 'Delete a ticket type (Admin)' })
  @ApiParam({ name: 'ticketTypeId', description: 'Ticket Type ID' })
  @ApiResponse({ status: 200, description: 'Ticket type deleted' })
  async deleteTicketType(@Param('ticketTypeId') ticketTypeId: string) {
    return this.concertsService.deleteTicketType(ticketTypeId);
  }
}
