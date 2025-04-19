import { Module } from '@nestjs/common';
import { CompetitorStatusController } from './competitor-status.controller';
import { CompetitorStatusService } from './competitor-status.service';

@Module({
  controllers: [CompetitorStatusController],
  providers: [CompetitorStatusService],
})
export class CompetitorStatusModule {}
