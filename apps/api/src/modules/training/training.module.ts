import { MikroOrmModule } from '@mikro-orm/nestjs';
import { forwardRef, Module } from '@nestjs/common';

import { AthletesModule } from '../athletes/athletes.module';
import { IdentityModule } from '../identity/identity.module';

import { Athlete } from '../athletes/domain/athlete.entity';
import { Workout } from './domain/workout.entity';
import { TrainingSession } from './domain/training-session.entity';
import { AthleteTrainingSession } from './domain/athlete-training-session.entity';
import { WorkoutCategory } from './domain/workout-category.entity';
import { ExerciseCategory } from './domain/exercise-category.entity';
import { WorkoutElement } from './domain/workout-element.entity';
import { ComplexCategory } from './domain/complex-category.entity';
import { ExerciseComplex } from './domain/exercise-complex.entity';
import { Exercise } from './domain/exercise.entity';
import { Complex } from './domain/complex.entity';

import { TrainingSessionController } from './interface/controllers/training-session.controller';
import { ComplexController } from './interface/controllers/complex.controller';
import { ComplexCategoryController } from './interface/controllers/complex-category.controller';
import { ExerciseCategoryController } from './interface/controllers/exercise-category.controller';
import { ExerciseController } from './interface/controllers/exercise.controller';
import { WorkoutCategoryController } from './interface/controllers/workout-category.controller';
import { WorkoutController } from './interface/controllers/workout.controller';

import { TrainingSessionUseCase } from './application/use-cases/training-session.use-cases';
import { ComplexUseCase } from './application/use-cases/complex.use-cases';
import { ComplexCategoryUseCase } from './application/use-cases/complex-category.use-cases';
import { ExerciseCategoryUseCase } from './application/use-cases/exercise-category.use-cases';
import { ExerciseUseCase } from './application/use-cases/exercise.use-cases';
import { WorkoutCategoryUseCase } from './application/use-cases/workout-category.use-cases';
import { WorkoutUseCases } from './application/use-cases/workout.use-cases';

import { MikroTrainingSessionRepository } from './infrastructure/mikro-training-session.repository';
import { MikroAthleteTrainingSessionRepository } from './infrastructure/mikro-athlete-training-session.repository';
import { MikroExerciseComplexRepository } from './infrastructure/mikro-exercise-complex.repository';
import { MikroComplexRepository } from './infrastructure/mikro-complex.repository';
import { MikroComplexCategoryRepository } from './infrastructure/mikro-complex-category.repository';
import { MikroExerciseCategoryRepository } from './infrastructure/mikro-exercise-category.repository';
import { MikroExerciseRepository } from './infrastructure/mikro-exercise.repository';
import { MikroWorkoutCategoryRepository } from './infrastructure/mikro-workout-category.repository';
import { MikroWorkoutRepository } from './infrastructure/mikro-workout.repository';
import { MikroWorkoutElementRepository } from './infrastructure/mikro-workout-element.repository';

import { TRAINING_SESSION_REPO } from './application/ports/training-session.repository';
import { ATHLETE_TRAINING_SESSION_REPO } from './application/ports/athlete-training-session.repository';
import { EXERCISE_COMPLEX_REPO } from './application/ports/exercise-complex.repository';
import { COMPLEX_REPO } from './application/ports/complex.repository';
import { COMPLEX_CATEGORY_REPO } from './application/ports/complex-category.repository';
import { EXERCISE_CATEGORY_REPO } from './application/ports/exercise-category.repository';
import { EXERCISE_REPO } from './application/ports/exercise.repository';
import { WORKOUT_CATEGORY_REPO } from './application/ports/workout-category.repository';
import { WORKOUT_REPO } from './application/ports/workout.repository';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [
        TrainingSession, 
        AthleteTrainingSession, 
        Athlete, 
        Workout,
        WorkoutCategory, 
        Complex, 
        ComplexCategory, 
        Exercise, 
        ExerciseCategory,
        ExerciseComplex, 
        WorkoutElement,
      ],
    }),
    forwardRef(() => AthletesModule),
    forwardRef(() => IdentityModule),
  ],
  controllers: [
    TrainingSessionController,
    ComplexController,
    ComplexCategoryController,
    ExerciseController,
    ExerciseCategoryController,
    WorkoutController,
    WorkoutCategoryController,
  ],
  providers: [
    // implementations MikroORM
    MikroTrainingSessionRepository,
    MikroAthleteTrainingSessionRepository,
    MikroComplexRepository,
    MikroComplexCategoryRepository,
    MikroExerciseRepository,
    MikroExerciseCategoryRepository,
    MikroExerciseComplexRepository,
    MikroWorkoutRepository,
    MikroWorkoutCategoryRepository,
    MikroWorkoutElementRepository,

    // use-cases
    TrainingSessionUseCase,
    ComplexUseCase,
    ComplexCategoryUseCase,
    ExerciseCategoryUseCase,
    ExerciseUseCase,
    WorkoutCategoryUseCase,
    TrainingSessionUseCase,
    WorkoutUseCases,

    // liaisons port -> implementation
    { provide: TRAINING_SESSION_REPO,  useClass: MikroTrainingSessionRepository },
    { provide: ATHLETE_TRAINING_SESSION_REPO, useClass: MikroAthleteTrainingSessionRepository },
    { provide: COMPLEX_REPO, useClass: MikroComplexRepository },
    { provide: EXERCISE_COMPLEX_REPO, useClass: MikroExerciseComplexRepository },
    { provide: COMPLEX_CATEGORY_REPO, useClass: MikroComplexCategoryRepository },
    { provide: EXERCISE_CATEGORY_REPO, useClass: MikroExerciseCategoryRepository },
    { provide: EXERCISE_REPO, useClass: MikroExerciseRepository },
    { provide: WORKOUT_CATEGORY_REPO, useClass: MikroWorkoutCategoryRepository },
    { provide: WORKOUT_REPO, useClass: MikroWorkoutRepository },
  ],
  exports: [
    TRAINING_SESSION_REPO, 
    ATHLETE_TRAINING_SESSION_REPO, 
    COMPLEX_REPO, 
    EXERCISE_COMPLEX_REPO, 
    COMPLEX_CATEGORY_REPO,
    EXERCISE_CATEGORY_REPO,
    EXERCISE_REPO,
    WORKOUT_CATEGORY_REPO,
    WORKOUT_REPO,
  ],
})
export class TrainingModule {}
