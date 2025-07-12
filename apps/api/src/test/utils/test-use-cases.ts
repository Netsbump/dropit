import { MikroORM } from '@mikro-orm/core';
import { ComplexCategoryUseCase } from '../../modules/training/application/use-cases/complex-category.use-cases';
import { ComplexUseCase } from '../../modules/training/application/use-cases/complex.use-cases';
import { ExerciseCategoryUseCase } from '../../modules/training/application/use-cases/exercise-category.use-cases';
import { ExerciseUseCase } from '../../modules/training/application/use-cases/exercise.use-cases';
import { WorkoutCategoryUseCase } from '../../modules/training/application/use-cases/workout-category.use-cases';
import { WorkoutUseCases } from '../../modules/training/application/use-cases/workout.use-cases';
import { TrainingSessionUseCase } from '../../modules/training/application/use-cases/training-session.use-cases';
import { OrganizationService } from '../../modules/identity/organization/organization.service';
import { MikroExerciseCategoryRepository } from '../../modules/training/infrastructure/mikro-exercise-category.repository';
import { MikroExerciseRepository } from '../../modules/training/infrastructure/mikro-exercise.repository';
import { MikroComplexCategoryRepository } from '../../modules/training/infrastructure/mikro-complex-category.repository';
import { MikroComplexRepository } from '../../modules/training/infrastructure/mikro-complex.repository';
import { MikroExerciseComplexRepository } from '../../modules/training/infrastructure/mikro-exercise-complex.repository';
import { MikroWorkoutCategoryRepository } from '../../modules/training/infrastructure/mikro-workout-category.repository';
import { MikroWorkoutRepository } from '../../modules/training/infrastructure/mikro-workout.repository';
import { MikroWorkoutElementRepository } from '../../modules/training/infrastructure/mikro-workout-element.repository';
import { MikroTrainingSessionRepository } from '../../modules/training/infrastructure/mikro-training-session.repository';
import { MikroAthleteTrainingSessionRepository } from '../../modules/training/infrastructure/mikro-athlete-training-session.repository';
import { MikroAthleteRepository } from '../../modules/athletes/infrastructure/mikro-athlete.repository';

/**
 * Factory pour créer les use cases avec les repositories MikroORM
 * Utilisé dans les tests d'intégration pour éviter la complexité de l'injection de dépendances NestJS
 */
export class TestUseCaseFactory {
  constructor(private readonly orm: MikroORM) {}

  /**
   * Crée l'OrganizationService
   */
  createOrganizationService(): OrganizationService {
    return new OrganizationService(this.orm.em);
  }

  /**
   * Crée l'ExerciseCategoryUseCase
   */
  createExerciseCategoryUseCase(): ExerciseCategoryUseCase {
    const organizationService = this.createOrganizationService();
    const exerciseCategoryRepository = new MikroExerciseCategoryRepository(this.orm.em);
    return new ExerciseCategoryUseCase(exerciseCategoryRepository, organizationService);
  }

  /**
   * Crée l'ExerciseUseCase
   */
  createExerciseUseCase(): ExerciseUseCase {
    const organizationService = this.createOrganizationService();
    const exerciseRepository = new MikroExerciseRepository(this.orm.em);
    const exerciseCategoryRepository = new MikroExerciseCategoryRepository(this.orm.em);
    return new ExerciseUseCase(exerciseRepository, exerciseCategoryRepository, organizationService);
  }

  /**
   * Crée le ComplexCategoryUseCase
   */
  createComplexCategoryUseCase(): ComplexCategoryUseCase {
    const organizationService = this.createOrganizationService();
    const complexCategoryRepository = new MikroComplexCategoryRepository(this.orm.em);
    return new ComplexCategoryUseCase(complexCategoryRepository, organizationService);
  }

  /**
   * Crée le ComplexUseCase
   */
  createComplexUseCase(): ComplexUseCase {
    const organizationService = this.createOrganizationService();
    const complexRepository = new MikroComplexRepository(this.orm.em);
    const complexCategoryRepository = new MikroComplexCategoryRepository(this.orm.em);
    const exerciseRepository = new MikroExerciseRepository(this.orm.em);
    const exerciseComplexRepository = new MikroExerciseComplexRepository(this.orm.em);
    return new ComplexUseCase(complexRepository, complexCategoryRepository, exerciseRepository, exerciseComplexRepository, organizationService);
  }

  /**
   * Crée le WorkoutCategoryUseCase
   */
  createWorkoutCategoryUseCase(): WorkoutCategoryUseCase {
    const organizationService = this.createOrganizationService();
    const workoutCategoryRepository = new MikroWorkoutCategoryRepository(this.orm.em);
    return new WorkoutCategoryUseCase(workoutCategoryRepository, organizationService);
  }

  /**
   * Crée le WorkoutUseCases
   */
  createWorkoutUseCases(): WorkoutUseCases {
    const organizationService = this.createOrganizationService();
    const workoutRepository = new MikroWorkoutRepository(this.orm.em);
    const workoutCategoryRepository = new MikroWorkoutCategoryRepository(this.orm.em);
    const complexRepository = new MikroComplexRepository(this.orm.em);
    const exerciseRepository = new MikroExerciseRepository(this.orm.em);
    const workoutElementRepository = new MikroWorkoutElementRepository(this.orm.em);
    const athleteRepository = new MikroAthleteRepository(this.orm.em);
    const trainingSessionRepository = new MikroTrainingSessionRepository(this.orm.em);
    const athleteTrainingSessionRepository = new MikroAthleteTrainingSessionRepository(this.orm.em);
    
    return new WorkoutUseCases(
      workoutRepository,
      workoutCategoryRepository,
      complexRepository,
      exerciseRepository,
      workoutElementRepository,
      athleteRepository,
      trainingSessionRepository,
      athleteTrainingSessionRepository,
      organizationService
    );
  }

  /**
   * Crée le TrainingSessionUseCase
   */
  createTrainingSessionUseCase(): TrainingSessionUseCase {
    const organizationService = this.createOrganizationService();
    const trainingSessionRepository = new MikroTrainingSessionRepository(this.orm.em);
    const athleteTrainingSessionRepository = new MikroAthleteTrainingSessionRepository(this.orm.em);
    const workoutRepository = new MikroWorkoutRepository(this.orm.em);
    const athleteRepository = new MikroAthleteRepository(this.orm.em);
    
    return new TrainingSessionUseCase(
      trainingSessionRepository,
      athleteTrainingSessionRepository,
      organizationService,
      workoutRepository,
      athleteRepository
    );
  }
} 