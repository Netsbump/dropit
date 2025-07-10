import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import { Athlete } from '../athlete/domain/athlete.entity';
import { AthleteModule } from '../athlete/athlete.module';
import { Exercise } from '../../training/exercise/exercise.entity';
import { ExerciseModule } from '../../training/exercise/exercise.module';
import { PersonalRecordController } from './personal-record.controller';
import { PersonalRecord } from './personal-record.entity';
import { PersonalRecordService } from './personal-record.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([PersonalRecord, Athlete, Exercise]),
    forwardRef(() => AthleteModule),
    forwardRef(() => ExerciseModule),
  ],
  controllers: [PersonalRecordController],
  providers: [PersonalRecordService],
  exports: [PersonalRecordService],
})
export class PersonalRecordModule {}
