import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CompetitorStatus } from '../../entities';
import { CompetitorStatusController } from './competitor-status.controller';
import { CompetitorStatusService } from './competitor-status.service';

@Module({
  imports: [MikroOrmModule.forFeature([CompetitorStatus])],
  controllers: [CompetitorStatusController],
  providers: [CompetitorStatusService],
})
export class CompetitorStatusModule {}
