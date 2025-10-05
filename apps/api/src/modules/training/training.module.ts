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
import { AthleteTrainingSessionController } from './interface/controllers/athlete-training-session.controller';
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

import { TRAINING_SESSION_REPO, ITrainingSessionRepository } from './application/ports/training-session.repository.port';
import { ATHLETE_TRAINING_SESSION_REPO, IAthleteTrainingSessionRepository } from './application/ports/athlete-training-session.repository.port';
import { EXERCISE_COMPLEX_REPO, IExerciseComplexRepository } from './application/ports/exercise-complex.repository.port';
import { COMPLEX_REPO, IComplexRepository } from './application/ports/complex.repository.port';
import { COMPLEX_CATEGORY_REPO, IComplexCategoryRepository } from './application/ports/complex-category.repository.port';
import { EXERCISE_CATEGORY_REPO, IExerciseCategoryRepository } from './application/ports/exercise-category.repository.port';
import { EXERCISE_REPO, IExerciseRepository } from './application/ports/exercise.repository.port';
import { WORKOUT_CATEGORY_REPO, IWorkoutCategoryRepository } from './application/ports/workout-category.repository.port';
import { WORKOUT_REPO, IWorkoutRepository } from './application/ports/workout.repository.port';
import { WORKOUT_ELEMENT_REPO, IWorkoutElementRepository } from './application/ports/workout-element.repository.port';

// Use cases ports
import { TRAINING_SESSION_USE_CASES } from './application/ports/training-session-use-cases.port';
import { WORKOUT_USE_CASES } from './application/ports/workout-use-cases.port';
import { EXERCISE_USE_CASES } from './application/ports/exercise-use-cases.port';
import { COMPLEX_USE_CASES } from './application/ports/complex-use-cases.port';
import { WORKOUT_CATEGORY_USE_CASES } from './application/ports/workout-category-use-cases.port';
import { EXERCISE_CATEGORY_USE_CASES } from './application/ports/exercise-category-use-cases.port';
import { COMPLEX_CATEGORY_USE_CASES } from './application/ports/complex-category-use-cases.port';

// External dependencies
import { ATHLETE_REPO, IAthleteRepository } from '../athletes/application/ports/athlete.repository.port';
import { USER_USE_CASES, IUserUseCases } from '../identity/application/ports/user-use-cases.port';
import { MEMBER_USE_CASES, IMemberUseCases } from '../identity/application/ports/member-use-cases.port';
import { ORGANIZATION_USE_CASES, IOrganizationUseCases } from '../identity/application/ports/organization-use-cases.port';

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
    AthleteTrainingSessionController,
    ComplexController,
    ComplexCategoryController,
    ExerciseController,
    ExerciseCategoryController,
    WorkoutController,
    WorkoutCategoryController,
  ],
  providers: [
    // implémentations MikroORM
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

    // liaisons port -> implémentation (repositories)
    { provide: TRAINING_SESSION_REPO, useClass: MikroTrainingSessionRepository },
    { provide: ATHLETE_TRAINING_SESSION_REPO, useClass: MikroAthleteTrainingSessionRepository },
    { provide: COMPLEX_REPO, useClass: MikroComplexRepository },
    { provide: EXERCISE_COMPLEX_REPO, useClass: MikroExerciseComplexRepository },
    { provide: COMPLEX_CATEGORY_REPO, useClass: MikroComplexCategoryRepository },
    { provide: EXERCISE_CATEGORY_REPO, useClass: MikroExerciseCategoryRepository },
    { provide: EXERCISE_REPO, useClass: MikroExerciseRepository },
    { provide: WORKOUT_CATEGORY_REPO, useClass: MikroWorkoutCategoryRepository },
    { provide: WORKOUT_REPO, useClass: MikroWorkoutRepository },
    { provide: WORKOUT_ELEMENT_REPO, useClass: MikroWorkoutElementRepository },

    // use-cases (concrete implementations)
    TrainingSessionUseCase,
    ComplexUseCase,
    ComplexCategoryUseCase,
    ExerciseCategoryUseCase,
    ExerciseUseCase,
    WorkoutCategoryUseCase,
    WorkoutUseCases,

    // liaisons port -> implémentation (use-cases)
    {
      provide: TRAINING_SESSION_USE_CASES,
      useFactory: (
        trainingSessionRepo: ITrainingSessionRepository,
        athleteTrainingSessionRepo: IAthleteTrainingSessionRepository,
        organizationUseCases: IOrganizationUseCases,
        workoutRepo: IWorkoutRepository,
        athleteRepo: IAthleteRepository,
        memberUseCases: IMemberUseCases
      ) => {
        return new TrainingSessionUseCase(
          trainingSessionRepo,
          athleteTrainingSessionRepo,
          organizationUseCases,
          workoutRepo,
          athleteRepo,
          memberUseCases
        );
      },
      inject: [TRAINING_SESSION_REPO, ATHLETE_TRAINING_SESSION_REPO, ORGANIZATION_USE_CASES, WORKOUT_REPO, ATHLETE_REPO, MEMBER_USE_CASES],
    },
    {
      provide: WORKOUT_USE_CASES,
      useFactory: (
        workoutRepo: IWorkoutRepository,
        workoutCategoryRepo: IWorkoutCategoryRepository,
        complexRepo: IComplexRepository,
        exerciseRepo: IExerciseRepository,
        workoutElementRepo: IWorkoutElementRepository,
        athleteRepo: IAthleteRepository,
        trainingSessionRepo: ITrainingSessionRepository,
        athleteTrainingSessionRepo: IAthleteTrainingSessionRepository,
        userUseCases: IUserUseCases,
        memberUseCases: IMemberUseCases,
        organizationUseCases: IOrganizationUseCases
      ) => {
        return new WorkoutUseCases(
          workoutRepo,
          workoutCategoryRepo,
          complexRepo,
          exerciseRepo,
          workoutElementRepo,
          athleteRepo,
          trainingSessionRepo,
          athleteTrainingSessionRepo,
          userUseCases,
          memberUseCases,
          organizationUseCases
        );
      },
      inject: [WORKOUT_REPO, WORKOUT_CATEGORY_REPO, COMPLEX_REPO, EXERCISE_REPO, WORKOUT_ELEMENT_REPO, ATHLETE_REPO, TRAINING_SESSION_REPO, ATHLETE_TRAINING_SESSION_REPO, USER_USE_CASES, MEMBER_USE_CASES, ORGANIZATION_USE_CASES],
    },
    {
      provide: EXERCISE_USE_CASES,
      useFactory: (
        exerciseRepo: IExerciseRepository,
        exerciseCategoryRepo: IExerciseCategoryRepository,
        userUseCases: IUserUseCases,
        memberUseCases: IMemberUseCases
      ) => {
        return new ExerciseUseCase(exerciseRepo, exerciseCategoryRepo, userUseCases, memberUseCases);
      },
      inject: [EXERCISE_REPO, EXERCISE_CATEGORY_REPO, USER_USE_CASES, MEMBER_USE_CASES],
    },
    {
      provide: COMPLEX_USE_CASES,
      useFactory: (
        complexRepo: IComplexRepository,
        complexCategoryRepo: IComplexCategoryRepository,
        exerciseRepo: IExerciseRepository,
        exerciseComplexRepo: IExerciseComplexRepository,
        userUseCases: IUserUseCases,
        memberUseCases: IMemberUseCases
      ) => {
        return new ComplexUseCase(complexRepo, complexCategoryRepo, exerciseRepo, exerciseComplexRepo, userUseCases, memberUseCases);
      },
      inject: [COMPLEX_REPO, COMPLEX_CATEGORY_REPO, EXERCISE_REPO, EXERCISE_COMPLEX_REPO, USER_USE_CASES, MEMBER_USE_CASES],
    },
    {
      provide: WORKOUT_CATEGORY_USE_CASES,
      useFactory: (
        workoutCategoryRepo: IWorkoutCategoryRepository,
        userUseCases: IUserUseCases,
        memberUseCases: IMemberUseCases
      ) => {
        return new WorkoutCategoryUseCase(workoutCategoryRepo, userUseCases, memberUseCases);
      },
      inject: [WORKOUT_CATEGORY_REPO, USER_USE_CASES, MEMBER_USE_CASES],
    },
    {
      provide: EXERCISE_CATEGORY_USE_CASES,
      useFactory: (
        exerciseCategoryRepo: IExerciseCategoryRepository,
        userUseCases: IUserUseCases,
        memberUseCases: IMemberUseCases
      ) => {
        return new ExerciseCategoryUseCase(exerciseCategoryRepo, userUseCases, memberUseCases);
      },
      inject: [EXERCISE_CATEGORY_REPO, USER_USE_CASES, MEMBER_USE_CASES],
    },
    {
      provide: COMPLEX_CATEGORY_USE_CASES,
      useFactory: (
        complexCategoryRepo: IComplexCategoryRepository,
        userUseCases: IUserUseCases,
        memberUseCases: IMemberUseCases
      ) => {
        return new ComplexCategoryUseCase(complexCategoryRepo, userUseCases, memberUseCases);
      },
      inject: [COMPLEX_CATEGORY_REPO, USER_USE_CASES, MEMBER_USE_CASES],
    },
  ],
  exports: [
    // ce que d'autres modules pourront injecter
    TRAINING_SESSION_REPO, 
    ATHLETE_TRAINING_SESSION_REPO, 
    COMPLEX_REPO, 
    EXERCISE_COMPLEX_REPO, 
    COMPLEX_CATEGORY_REPO,
    EXERCISE_CATEGORY_REPO,
    EXERCISE_REPO,
    WORKOUT_CATEGORY_REPO,
    WORKOUT_REPO,
    WORKOUT_ELEMENT_REPO,
    
    // Ports pour les use-cases
    TRAINING_SESSION_USE_CASES,
    WORKOUT_USE_CASES,
    EXERCISE_USE_CASES,
    COMPLEX_USE_CASES,
    WORKOUT_CATEGORY_USE_CASES,
    EXERCISE_CATEGORY_USE_CASES,
    COMPLEX_CATEGORY_USE_CASES,
  ],
})
export class TrainingModule {}
