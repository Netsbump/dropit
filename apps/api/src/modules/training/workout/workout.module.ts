import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import { Athlete } from '../../members/athlete/athlete.entity';
import { AthleteModule } from '../../members/athlete/athlete.module';
import { AthleteSession } from '../../performance/athlete-session/athlete-session.entity';
import { Session } from '../../performance/session/session.entity';
import { SessionModule } from '../../performance/session/session.module';
import { Complex } from '../complex/complex.entity';
import { Exercise } from '../exercise/exercise.entity';
import { ExerciseModule } from '../exercise/exercise.module';
import { WorkoutCategory } from '../workout-category/workout-category.entity';
import { WorkoutCategoryModule } from '../workout-category/workout-category.module';
import { WorkoutElement } from '../workout-element/workout-element.entity';
import { WorkoutController } from './workout.controller';
import { Workout } from './workout.entity';
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
