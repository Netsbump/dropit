import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CompetitorStatusController } from './interface/competitor-status.controller';
import { CompetitorStatus } from '../athlete/domain/competitor-status.entity';
import { CompetitorStatusUseCases } from './application/use-cases/competitor-status.use-cases';

@Module({
  imports: [MikroOrmModule.forFeature([CompetitorStatus])],
  controllers: [CompetitorStatusController],
  providers: [CompetitorStatusUseCases],
})
export class CompetitorStatusModule {}
