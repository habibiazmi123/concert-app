import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminGateway } from './admin.gateway';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminGateway],
  exports: [AdminGateway],
})
export class AdminModule {}
