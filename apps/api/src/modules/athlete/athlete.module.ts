import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import { Athlete } from '../../entities/athlete.entity';
import { PersonalRecord } from '../../entities/personal-record.entity';
import { PersonalRecordModule } from '../personal-record/personal-record.module';
import { AthleteController } from './athlete.controller';
import { AthleteRepository } from './athlete.repository';
import { CreateAthleteUseCase } from './use-cases/create-athlete.use-case';
import { DeleteAthleteUseCase } from './use-cases/delete-athlete.use-case';
import { GetAthleteUseCase } from './use-cases/get-athlete.use-case';
import { GetAthletesUseCase } from './use-cases/get-athletes.use-case';
import { UpdateAthleteUseCase } from './use-cases/update-athlete.use-case';

@Module({
  imports: [
    MikroOrmModule.forFeature([Athlete, PersonalRecord]),
    forwardRef(() => PersonalRecordModule),
  ],
  controllers: [AthleteController],
  providers: [
    AthleteRepository,
    GetAthletesUseCase,
    GetAthleteUseCase,
    CreateAthleteUseCase,
    UpdateAthleteUseCase,
    DeleteAthleteUseCase,
  ],
  exports: [AthleteRepository],
})
export class AthleteModule {}
