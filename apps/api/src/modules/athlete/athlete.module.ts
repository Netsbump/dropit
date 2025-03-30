import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Athlete } from '../../entities/athlete.entity';
import { AthleteController } from './athlete.controller';
import { AthleteRepository } from './athlete.repository';
import { AthleteService } from './athlete.service';

@Module({
  imports: [MikroOrmModule.forFeature([Athlete])],
  controllers: [AthleteController],
  providers: [AthleteService, AthleteRepository],
  exports: [AthleteService],
})
export class AthleteModule {}
