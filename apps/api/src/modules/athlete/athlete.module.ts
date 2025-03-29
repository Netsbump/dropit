import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Athlete } from '../../entities/athlete.entity';
import { AthleteController } from './athlete.controller';
import { AthleteService } from './athlete.service';
import { AthleteRepository } from './athlete.repository';

@Module({
  imports: [MikroOrmModule.forFeature([Athlete])],
  controllers: [AthleteController],
  providers: [AthleteService, AthleteRepository],
  exports: [AthleteService],
})
export class AthleteModule {}
