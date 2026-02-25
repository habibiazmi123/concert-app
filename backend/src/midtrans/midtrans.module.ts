import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SnapService } from './snap.service';
import { MidtransService } from './midtrans.service';

@Module({
  imports: [HttpModule],
  providers: [SnapService, MidtransService],
  exports: [SnapService, MidtransService],
})
export class MidtransModule {}
