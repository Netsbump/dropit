import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CompetitorStatusController } from './competitor-status.controller';
import { CompetitorStatus } from './competitor-status.entity';
import { CompetitorStatusService } from './competitor-status.service';

@Module({
  imports: [MikroOrmModule.forFeature([CompetitorStatus])],
  controllers: [CompetitorStatusController],
  providers: [CompetitorStatusService],
})
export class CompetitorStatusModule {}
