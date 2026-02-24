import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Get sales analytics dashboard data' })
  @ApiResponse({ status: 200, description: 'Analytics data' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin only' })
  async getAnalytics() {
    return this.adminService.getSalesAnalytics();
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get booking logs (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Paginated booking logs' })
  async getBookingLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getBookingLogs(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('queue-status')
  @ApiOperation({ summary: 'Get BullMQ queue status' })
  @ApiResponse({ status: 200, description: 'Queue health and job counts' })
  async getQueueStatus() {
    return this.adminService.getQueueStatus();
  }
}
