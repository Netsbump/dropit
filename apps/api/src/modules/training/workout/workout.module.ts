import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import { Athlete } from '../../members/athlete/athlete.entity';
import { AthleteModule } from '../../members/athlete/athlete.module';
import { OrganizationModule } from '../../members/organization/organization.module';
import { AthleteTrainingSession } from '../../performance/athlete-training-session/athlete-training-session.entity';
import { TrainingSession } from '../../performance/training-session/training-session.entity';
import { TrainingSessionModule } from '../../performance/training-session/training-session.module';
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
      AthleteTrainingSession,
      Athlete,
      Exercise,
      TrainingSession,
      WorkoutCategory,
      WorkoutElement,
    ]),
    forwardRef(() => AthleteModule),
    forwardRef(() => TrainingSessionModule),
    forwardRef(() => WorkoutCategoryModule),
    forwardRef(() => ExerciseModule),
    OrganizationModule,
  ],
  controllers: [WorkoutController],
  providers: [
    WorkoutService,
  ],
})
export class WorkoutModule {}
