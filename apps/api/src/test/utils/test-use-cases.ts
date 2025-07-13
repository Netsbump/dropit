import { MikroORM } from '@mikro-orm/core';
import { ComplexCategoryUseCase } from '../../modules/training/application/use-cases/complex-category.use-cases';
import { ComplexUseCase } from '../../modules/training/application/use-cases/complex.use-cases';
import { ExerciseCategoryUseCase } from '../../modules/training/application/use-cases/exercise-category.use-cases';
import { ExerciseUseCase } from '../../modules/training/application/use-cases/exercise.use-cases';
import { WorkoutCategoryUseCase } from '../../modules/training/application/use-cases/workout-category.use-cases';
import { WorkoutUseCases } from '../../modules/training/application/use-cases/workout.use-cases';
import { TrainingSessionUseCase } from '../../modules/training/application/use-cases/training-session.use-cases';
import { OrganizationUseCases } from '../../modules/identity/application/organization.use-cases';
import { UserUseCases } from '../../modules/identity/application/user.use-cases';
import { MemberUseCases } from '../../modules/identity/application/member.use-cases';
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
import { MikroOrganizationRepository } from '../../modules/identity/infrastructure/orm/mikro-organization.repository';
import { MikroUserRepository } from '../../modules/identity/infrastructure/orm/mikro-user.repository';
import { MikroMemberRepository } from '../../modules/identity/infrastructure/orm/mikro-member.repository';

/**
 * Factory pour créer les use cases avec les repositories MikroORM
 * Utilisé dans les tests d'intégration pour éviter la complexité de l'injection de dépendances NestJS
 */
export class TestUseCaseFactory {
  constructor(private readonly orm: MikroORM) {}

  /**
   * Crée les use cases communs
   */
  private createCommonUseCases() {
    const userRepository = new MikroUserRepository(this.orm.em);
    const memberRepository = new MikroMemberRepository(this.orm.em);
    const userUseCases = new UserUseCases(userRepository);
    const memberUseCases = new MemberUseCases(memberRepository);
    return { userUseCases, memberUseCases };
  }

  /**
   * Crée l'OrganizationUseCases
   */
  createOrganizationUseCases(): OrganizationUseCases {
    const organizationRepository = new MikroOrganizationRepository(this.orm.em);
    return new OrganizationUseCases(organizationRepository);
  }

  /**
   * Crée l'ExerciseCategoryUseCase
   */
  createExerciseCategoryUseCase(): ExerciseCategoryUseCase {
    const { userUseCases, memberUseCases } = this.createCommonUseCases();
    const exerciseCategoryRepository = new MikroExerciseCategoryRepository(this.orm.em);
    return new ExerciseCategoryUseCase(exerciseCategoryRepository, userUseCases, memberUseCases);
  }

  /**
   * Crée l'ExerciseUseCase
   */
  createExerciseUseCase(): ExerciseUseCase {
    const { userUseCases, memberUseCases } = this.createCommonUseCases();
    const exerciseRepository = new MikroExerciseRepository(this.orm.em);
    const exerciseCategoryRepository = new MikroExerciseCategoryRepository(this.orm.em);
    return new ExerciseUseCase(exerciseRepository, exerciseCategoryRepository, userUseCases, memberUseCases);
  }

  /**
   * Crée le ComplexCategoryUseCase
   */
  createComplexCategoryUseCase(): ComplexCategoryUseCase {
    const { userUseCases, memberUseCases } = this.createCommonUseCases();
    const complexCategoryRepository = new MikroComplexCategoryRepository(this.orm.em);
    return new ComplexCategoryUseCase(complexCategoryRepository, userUseCases, memberUseCases);
  }

  /**
   * Crée le ComplexUseCase
   */
  createComplexUseCase(): ComplexUseCase {
    const { userUseCases, memberUseCases } = this.createCommonUseCases();
    const complexRepository = new MikroComplexRepository(this.orm.em);
    const complexCategoryRepository = new MikroComplexCategoryRepository(this.orm.em);
    const exerciseRepository = new MikroExerciseRepository(this.orm.em);
    const exerciseComplexRepository = new MikroExerciseComplexRepository(this.orm.em);
    return new ComplexUseCase(complexRepository, complexCategoryRepository, exerciseRepository, exerciseComplexRepository, userUseCases, memberUseCases);
  }

  /**
   * Crée le WorkoutCategoryUseCase
   */
  createWorkoutCategoryUseCase(): WorkoutCategoryUseCase {
    const { userUseCases, memberUseCases } = this.createCommonUseCases();
    const workoutCategoryRepository = new MikroWorkoutCategoryRepository(this.orm.em);
    return new WorkoutCategoryUseCase(workoutCategoryRepository, userUseCases, memberUseCases);
  }

  /**
   * Crée le WorkoutUseCases
   */
  createWorkoutUseCases(): WorkoutUseCases {
    const { userUseCases, memberUseCases } = this.createCommonUseCases();
    const organizationUseCases = this.createOrganizationUseCases();
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
      userUseCases,
      memberUseCases,
      organizationUseCases
    );
  }

  /**
   * Crée le TrainingSessionUseCase
   */
  createTrainingSessionUseCase(): TrainingSessionUseCase {
    const { userUseCases, memberUseCases } = this.createCommonUseCases();
    const organizationUseCases = this.createOrganizationUseCases();
    const trainingSessionRepository = new MikroTrainingSessionRepository(this.orm.em);
    const athleteTrainingSessionRepository = new MikroAthleteTrainingSessionRepository(this.orm.em);
    const workoutRepository = new MikroWorkoutRepository(this.orm.em);
    const athleteRepository = new MikroAthleteRepository(this.orm.em);
    
    return new TrainingSessionUseCase(
      trainingSessionRepository,
      athleteTrainingSessionRepository,
      organizationUseCases,
      workoutRepository,
      athleteRepository,
      memberUseCases
    );
  }
} 