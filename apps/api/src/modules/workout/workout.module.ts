import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import {
  Athlete,
  AthleteSession,
  Complex,
  Exercise,
  Session,
  Workout,
  WorkoutCategory,
  WorkoutElement,
} from '../../entities';
import { AthleteModule } from '../athlete/athlete.module';
import { ExerciseModule } from '../exercise/exercise.module';
import { SessionModule } from '../session/session.module';
import { WorkoutCategoryModule } from '../workout-category/workout-category.module';
import { WorkoutController } from './workout.controller';
import { WorkoutService } from './workout.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Workout,
      Complex,
      AthleteSession,
      Athlete,
      Exercise,
      Session,
      WorkoutCategory,
      WorkoutElement,
    ]),
    forwardRef(() => AthleteModule),
    forwardRef(() => SessionModule),
    forwardRef(() => WorkoutCategoryModule),
    forwardRef(() => ExerciseModule),
  ],
  controllers: [WorkoutController],
  providers: [WorkoutService],
})
export class WorkoutModule {}
