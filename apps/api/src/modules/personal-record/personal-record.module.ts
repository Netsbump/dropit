import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import { Athlete, Exercise, PersonalRecord } from '../../entities';
import { AthleteModule } from '../athlete/athlete.module';
import { ExerciseModule } from '../exercise/exercise.module';
import { PersonalRecordController } from './personal-record.controller';
import { PersonalRecordService } from './personal-record.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([PersonalRecord, Athlete, Exercise]),
    forwardRef(() => AthleteModule),
    ExerciseModule,
  ],
  controllers: [PersonalRecordController],
  providers: [PersonalRecordService],
  exports: [PersonalRecordService],
})
export class PersonalRecordModule {}
