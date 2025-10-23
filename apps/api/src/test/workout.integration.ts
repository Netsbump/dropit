import { MikroORM } from '@mikro-orm/core';
import { ComplexCategoryUseCase } from '../modules/training/application/use-cases/complex-category.use-cases';
import { ComplexUseCase } from '../modules/training/application/use-cases/complex.use-cases';
import { ExerciseCategoryUseCase } from '../modules/training/application/use-cases/exercise-category.use-cases';
import { ExerciseUseCase } from '../modules/training/application/use-cases/exercise.use-cases';
import { WorkoutCategoryUseCase } from '../modules/training/application/use-cases/workout-category.use-cases';
import { WorkoutUseCases } from '../modules/training/application/use-cases/workout.use-cases';
import { OrganizationUseCases } from '../modules/identity/application/organization.use-cases';
import { WORKOUT_ELEMENT_TYPES } from '../modules/training/domain/workout-element.entity';
import { Exercise } from '../modules/training/domain/exercise.entity';
import { ExerciseCategory } from '../modules/training/domain/exercise-category.entity';
import { Complex } from '../modules/training/domain/complex.entity';
import { ComplexCategory } from '../modules/training/domain/complex-category.entity';
import { Workout } from '../modules/training/domain/workout.entity';
import { WorkoutCategory } from '../modules/training/domain/workout-category.entity';
import { setupOrganization } from './organization.integration';
import { cleanDatabase, TestData } from './utils/test-setup';
import { TestUseCaseFactory } from './utils/test-use-cases';

/**
 * Exécute les tests d'intégration pour les workouts
 */
export async function runWorkoutTests(orm: MikroORM): Promise<void> {
  console.log('📋 Running workout integration tests...');
  
  let exerciseCategoryUseCase: ExerciseCategoryUseCase;
  let exerciseUseCase: ExerciseUseCase;
  let complexCategoryUseCase: ComplexCategoryUseCase;
  let complexUseCase: ComplexUseCase;
  let workoutCategoryUseCase: WorkoutCategoryUseCase;
  let workoutUseCase: WorkoutUseCases;
  let organizationUseCases: OrganizationUseCases;
  let testData: TestData;
  let exerciseCategory: ExerciseCategory;
  let complexCategory: ComplexCategory;
  let workoutCategory: WorkoutCategory;

  try {
    // Nettoyer la base de données
    await cleanDatabase(orm);
    
    // Setup l'organisation (dépendance)
    testData = await setupOrganization(orm);
    
    // Utiliser la factory pour créer les use cases
    const factory = new TestUseCaseFactory(orm);
    organizationUseCases = factory.createOrganizationUseCases();
    exerciseCategoryUseCase = factory.createExerciseCategoryUseCase();
    exerciseUseCase = factory.createExerciseUseCase();
    complexCategoryUseCase = factory.createComplexCategoryUseCase();
    complexUseCase = factory.createComplexUseCase();
    workoutCategoryUseCase = factory.createWorkoutCategoryUseCase();
    workoutUseCase = factory.createWorkoutUseCases();

    // Créer les catégories via use cases
    try {
      exerciseCategory = await exerciseCategoryUseCase.create({ 
        name: 'Haltérophilie' 
      }, testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to create exercise category: ${(error as Error).message}`);
    }

    try {
      complexCategory = await complexCategoryUseCase.create({ 
        name: 'Complexes Haltérophilie' 
      }, testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to create complex category: ${(error as Error).message}`);
    }

    try {
      workoutCategory = await workoutCategoryUseCase.create({ 
        name: 'Workouts Haltérophilie' 
      }, testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to create workout category: ${(error as Error).message}`);
    }
    
    expect(workoutCategory).toBeDefined();
    expect(workoutCategory.id).toBeDefined();
    expect(workoutCategory.name).toBe('Workouts Haltérophilie');

    // Test 1: Créer des exercices et un complex
    console.log('🧪 Testing exercise and complex creation for workouts...');
    let exercise1: Exercise;
    let exercise2: Exercise;
    let complex: Complex;
    try {
      exercise1 = await exerciseUseCase.create({
        name: 'Squat',
        description: 'Basic squat exercise',
        exerciseCategory: exerciseCategory.id,
      }, testData.organization.id, testData.adminUser.id);

      exercise2 = await exerciseUseCase.create({
        name: 'Deadlift',
        description: 'Basic deadlift exercise',
        exerciseCategory: exerciseCategory.id,
      }, testData.organization.id, testData.adminUser.id);

      complex = await complexUseCase.create({
        complexCategory: complexCategory.id,
        exercises: [
          {
            exerciseId: exercise1.id,
            order: 1,
            reps: 10,
          },
          {
            exerciseId: exercise2.id,
            order: 2,
            reps: 10,
          },
        ],
      }, testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to create exercises and complex: ${(error as Error).message}`);
    }

    expect(exercise1).toBeDefined();
    expect(exercise2).toBeDefined();
    expect(complex).toBeDefined();

    // Test 2: Créer un workout via use case
    console.log('🧪 Testing workout creation via use case...');
    let workout1: Workout;
    try {
      workout1 = await workoutUseCase.createWorkout({
        title: 'Test Workout',
        workoutCategory: workoutCategory.id,
        description: 'Test workout description',
        elements: [
          {
            type: WORKOUT_ELEMENT_TYPES.COMPLEX,
            id: complex.id,
            order: 0,
            reps: 1,
            sets: 1,
            rest: 120,
            startWeight_percent: 75,
          },
          {
            type: WORKOUT_ELEMENT_TYPES.EXERCISE,
            id: exercise2.id,
            order: 1,
            reps: 8,
            sets: 3,
            rest: 90,
            startWeight_percent: 70,
          },
        ],
      }, testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to create workout1: ${(error as Error).message}`);
    }
    expect(workout1).toBeDefined();
    expect(workout1.id).toBeDefined();
    expect(workout1.title).toBe('Test Workout');
    expect(workout1.elements.length).toBe(2);

    // Vérification du complex
    const elements = workout1.elements.toArray();
    const complexElement = elements[0];
    expect(complexElement.type).toBe('complex');
    expect(complexElement.complex).toBeDefined();
    expect(complexElement.complex?.exercises).toBeDefined();
    expect(complexElement.complex?.exercises.length).toBeGreaterThan(0);

    // Vérification de l'exercice simple
    const exerciseElement = elements[1];
    expect(exerciseElement.type).toBe('exercise');
    expect(exerciseElement.exercise).toBeDefined();
    expect(exerciseElement.reps).toBe(8);
    expect(exerciseElement.sets).toBe(3);
    expect(exerciseElement.rest).toBe(90);
    expect(exerciseElement.startWeight_percent).toBe(70);

    // Test 3: Créer un autre workout
    console.log('🧪 Testing second workout creation via use case...');
    let workout2: Workout;
    try {
      workout2 = await workoutUseCase.createWorkout({
        title: 'Second Workout',
        workoutCategory: workoutCategory.id,
        description: 'Second workout description',
        elements: [
          {
            type: WORKOUT_ELEMENT_TYPES.EXERCISE,
            id: exercise1.id,
            order: 0,
            reps: 5,
            sets: 3,
            rest: 60,
          },
        ],
      }, testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to create workout2: ${(error as Error).message}`);
    }
    expect(workout2).toBeDefined();
    expect(workout2.title).toBe('Second Workout');
    expect(workout2.elements.length).toBe(1);

    // Test 4: Récupérer tous les workouts via use case
    console.log('🧪 Testing workout retrieval via use case...');
    let workouts: Workout[];
    try {
      workouts = await workoutUseCase.getWorkouts(testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to get workouts: ${(error as Error).message}`);
    }
    expect(workouts.length).toBeGreaterThanOrEqual(2);

    // Test 5: Récupérer un workout spécifique
    console.log('🧪 Testing single workout retrieval via use case...');
    let singleWorkout: Workout;
    try {
      singleWorkout = await workoutUseCase.getWorkout(workout1.id, testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to get single workout: ${(error as Error).message}`);
    }
    expect(singleWorkout.id).toBe(workout1.id);
    expect(singleWorkout.title).toBe('Test Workout');

    // Test 6: Mettre à jour un workout via use case
    console.log('🧪 Testing workout update via use case...');
    let updatedWorkout: Workout;
    try {
      updatedWorkout = await workoutUseCase.updateWorkout(
        workout1.id,
        {
          title: 'Test Workout Modifié',
          description: 'Description modifiée',
        },
        testData.organization.id,
        testData.adminUser.id
      );
    } catch (error: unknown) {
      throw new Error(`Failed to update workout: ${(error as Error).message}`);
    }
    expect(updatedWorkout.title).toBe('Test Workout Modifié');
    expect(updatedWorkout.description).toBe('Description modifiée');

    // Test 7: Supprimer un workout via use case
    console.log('🧪 Testing workout deletion via use case...');
    try {
      await workoutUseCase.deleteWorkout(workout2.id, testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to delete workout: ${(error as Error).message}`);
    }

    let remainingWorkouts: Workout[];
    try {
      remainingWorkouts = await workoutUseCase.getWorkouts(testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to get remaining workouts: ${(error as Error).message}`);
    }
    expect(remainingWorkouts.length).toBe(workouts.length - 1);

    console.log('✅ Workout integration tests completed successfully');

  } catch (error) {
    console.error('❌ Workout integration tests failed:', error);
    throw error;
  }
} 