import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Athlete } from '../../members/athlete/athlete.entity';
import { AthleteModule } from '../../members/athlete/athlete.module';
import { AuthGuard } from '../../members/auth/auth.guard';
import { OrganizationModule } from '../../members/organization/organization.module';
import { BetterAuthPermissionGuard } from '../../core/better-auth-permission.guard';
import { AthleteSession } from '../../performance/athlete-session/athlete-session.entity';
import { TrainingSession } from '../../performance/session/session.entity';
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
      TrainingSession,
      WorkoutCategory,
      WorkoutElement,
    ]),
    forwardRef(() => AthleteModule),
    forwardRef(() => SessionModule),
    forwardRef(() => WorkoutCategoryModule),
    forwardRef(() => ExerciseModule),
    OrganizationModule,
  ],
  controllers: [WorkoutController],
  providers: [
    WorkoutService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: BetterAuthPermissionGuard,
    },
  ],
})
export class WorkoutModule {}
