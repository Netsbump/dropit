import {
  CreateExerciseInput,
  ExerciseCategoryDto,
  ExerciseDto,
} from '@dropit/schemas';
import { MikroORM } from '@mikro-orm/core';
import { ExerciseCategoryUseCase } from '../modules/training/application/use-cases/exercise-category.use-cases';
import { ExerciseUseCase } from '../modules/training/application/use-cases/exercise.use-cases';
import { OrganizationUseCases } from '../modules/auth/application/organization.use-cases';
import { Exercise } from '../modules/training/domain/exercise.entity';
import { ExerciseCategory } from '../modules/training/domain/exercise-category.entity';
import { setupOrganization } from './organization.integration';
import { cleanDatabase, TestData } from './utils/test-setup';
import { TestUseCaseFactory } from './utils/test-use-cases';

/**
 * Run integration tests for exercises
 */
export async function runExerciseTests(orm: MikroORM): Promise<void> {
  console.log('📋 Running exercise integration tests...');

  let exerciseCategoryUseCase: ExerciseCategoryUseCase;
  let exerciseUseCase: ExerciseUseCase;
  let organizationUseCases: OrganizationUseCases;
  let testData: TestData;
  let exerciseCategory: ExerciseCategory;

  try {
    // Clean the database
    await cleanDatabase(orm);

    // Setup organization (dependency)
    testData = await setupOrganization(orm);

    // Use the factory to create use cases
    const factory = new TestUseCaseFactory(orm);
    organizationUseCases = factory.createOrganizationUseCases();
    exerciseCategoryUseCase = factory.createExerciseCategoryUseCase();
    exerciseUseCase = factory.createExerciseUseCase();

    // Create an exercise category via use case
    try {
      exerciseCategory = await exerciseCategoryUseCase.create(
        {
          name: 'Haltérophilie',
        },
        testData.organization.id,
        testData.adminUser.id
      );
    } catch (error: unknown) {
      throw new Error(
        `Failed to create exercise category: ${(error as Error).message}`
      );
    }

    expect(exerciseCategory).toBeDefined();
    expect(exerciseCategory.id).toBeDefined();
    expect(exerciseCategory.name).toBe('Haltérophilie');

    // Test 1: Create exercises via use case
    console.log('🧪 Testing exercise creation via use case...');
    let exercise1: Exercise;
    try {
      exercise1 = await exerciseUseCase.create(
        {
          name: 'Squat',
          exerciseCategory: exerciseCategory.id,
        },
        testData.organization.id,
        testData.adminUser.id
      );
    } catch (error: unknown) {
      throw new Error(
        `Failed to create exercise1: ${(error as Error).message}`
      );
    }
    expect(exercise1).toBeDefined();
    expect(exercise1.id).toBeDefined();
    expect(exercise1.name).toBe('Squat');
    expect(exercise1.exerciseCategory.name).toBe('Haltérophilie');

    let exercise2: Exercise;
    try {
      exercise2 = await exerciseUseCase.create(
        {
          name: 'Push-up',
          exerciseCategory: exerciseCategory.id,
        },
        testData.organization.id,
        testData.adminUser.id
      );
    } catch (error: unknown) {
      throw new Error(
        `Failed to create exercise2: ${(error as Error).message}`
      );
    }
    expect(exercise2).toBeDefined();
    expect(exercise2.name).toBe('Push-up');

    let exercise3: Exercise;
    try {
      exercise3 = await exerciseUseCase.create(
        {
          name: 'Squat Clavicule',
          exerciseCategory: exerciseCategory.id,
          englishName: 'Front Squat',
          shortName: 'FS',
        },
        testData.organization.id,
        testData.adminUser.id
      );
    } catch (error: unknown) {
      throw new Error(
        `Failed to create exercise3: ${(error as Error).message}`
      );
    }
    expect(exercise3).toBeDefined();
    expect(exercise3.name).toBe('Squat Clavicule');
    expect(exercise3.englishName).toBe('Front Squat');
    expect(exercise3.shortName).toBe('FS');

    // Test 2: Get exercises via use case
    console.log('🧪 Testing exercise retrieval via use case...');
    let exercises: Exercise[];
    try {
      exercises = await exerciseUseCase.getAll(
        testData.organization.id,
        testData.adminUser.id
      );
    } catch (error: unknown) {
      throw new Error(`Failed to get exercises: ${(error as Error).message}`);
    }
    expect(exercises.length).toBeGreaterThanOrEqual(3);

    // Test 3: Get a specific exercise
    console.log('🧪 Testing single exercise retrieval via use case...');
    let singleExercise: Exercise;
    try {
      singleExercise = await exerciseUseCase.getOne(
        exercise1.id,
        testData.organization.id,
        testData.adminUser.id
      );
    } catch (error: unknown) {
      throw new Error(
        `Failed to get single exercise: ${(error as Error).message}`
      );
    }
    expect(singleExercise.id).toBe(exercise1.id);
    expect(singleExercise.name).toBe('Squat');

    // Test 4: Update an exercise via use case
    console.log('🧪 Testing exercise update via use case...');
    let updatedExercise: Exercise;
    try {
      updatedExercise = await exerciseUseCase.update(
        exercise1.id,
        {
          name: 'Squat Modifié',
        },
        testData.organization.id,
        testData.adminUser.id
      );
    } catch (error: unknown) {
      throw new Error(`Failed to update exercise: ${(error as Error).message}`);
    }
    expect(updatedExercise.name).toBe('Squat Modifié');

    // Test 5: Search exercises via use case
    console.log('🧪 Testing exercise search via use case...');
    let searchResults: Exercise[];
    try {
      searchResults = await exerciseUseCase.search(
        'Squat',
        testData.organization.id,
        testData.adminUser.id
      );
    } catch (error: unknown) {
      throw new Error(
        `Failed to search exercises: ${(error as Error).message}`
      );
    }
    expect(searchResults.length).toBeGreaterThanOrEqual(2); // Squat + Squat Clavicule

    // Test 6: Delete an exercise via use case
    console.log('🧪 Testing exercise deletion via use case...');
    try {
      await exerciseUseCase.delete(
        exercise2.id,
        testData.organization.id,
        testData.adminUser.id
      );
    } catch (error: unknown) {
      throw new Error(`Failed to delete exercise: ${(error as Error).message}`);
    }

    let remainingExercises: Exercise[];
    try {
      remainingExercises = await exerciseUseCase.getAll(
        testData.organization.id,
        testData.adminUser.id
      );
    } catch (error: unknown) {
      throw new Error(
        `Failed to get remaining exercises: ${(error as Error).message}`
      );
    }
    expect(remainingExercises.length).toBe(exercises.length - 1);

    console.log('✅ Exercise integration tests completed successfully');
  } catch (error) {
    console.error('❌ Exercise integration tests failed:', error);
    throw error;
  }
}
