import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import { Athlete } from '../../athletes/athlete/domain/athlete.entity';
import { AthleteModule } from '../../athletes/athlete/athlete.module';
import { OrganizationModule } from '../../identity/organization/organization.module';
import { AthleteTrainingSession } from '../training-session/domain/athlete-training-session.entity';
import { TrainingSession } from '../training-session/domain/training-session.entity';
import { TrainingSessionModule } from '../training-session/training-session.module';
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
  exports: [WorkoutService],
})
export class WorkoutModule {}
