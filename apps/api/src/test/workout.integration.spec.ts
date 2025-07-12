import { ComplexCategoryDto, ExerciseCategoryDto, WorkoutCategoryDto } from '@dropit/schemas';
import { MikroORM } from '@mikro-orm/core';
import { ComplexCategoryUseCase } from '../modules/training/application/use-cases/complex-category.use-cases';
import { ComplexUseCase } from '../modules/training/application/use-cases/complex.use-cases';
import { ExerciseCategoryUseCase } from '../modules/training/application/use-cases/exercise-category.use-cases';
import { ExerciseUseCase } from '../modules/training/application/use-cases/exercise.use-cases';
import { WorkoutCategoryUseCase } from '../modules/training/application/use-cases/workout-category.use-cases';
import { WorkoutUseCases } from '../modules/training/application/use-cases/workout.use-cases';
import { OrganizationService } from '../modules/identity/organization/organization.service';
import { WORKOUT_ELEMENT_TYPES } from '../modules/training/domain/workout-element.entity';
import { setupOrganization } from './organization.integration.spec';
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
  let organizationService: OrganizationService;
  let testData: TestData;
  let exerciseCategory: ExerciseCategoryDto;
  let complexCategory: ComplexCategoryDto;
  let workoutCategory: WorkoutCategoryDto;

  try {
    // Nettoyer la base de données
    await cleanDatabase(orm);
    
    // Setup l'organisation (dépendance)
    testData = await setupOrganization(orm);
    
    // Utiliser la factory pour créer les use cases
    const factory = new TestUseCaseFactory(orm);
    organizationService = factory.createOrganizationService();
    exerciseCategoryUseCase = factory.createExerciseCategoryUseCase();
    exerciseUseCase = factory.createExerciseUseCase();
    complexCategoryUseCase = factory.createComplexCategoryUseCase();
    complexUseCase = factory.createComplexUseCase();
    workoutCategoryUseCase = factory.createWorkoutCategoryUseCase();
    workoutUseCase = factory.createWorkoutUseCases();

    // Créer les catégories via use cases
    const exerciseCategoryResult = await exerciseCategoryUseCase.create({ 
      name: 'Haltérophilie' 
    }, testData.organization.id, testData.adminUser.id);

    if (exerciseCategoryResult.status !== 200) {
      throw new Error(`Failed to create exercise category: ${exerciseCategoryResult.body.message}`);
    }
    exerciseCategory = exerciseCategoryResult.body;

    const complexCategoryResult = await complexCategoryUseCase.create({ 
      name: 'Complexes Haltérophilie' 
    }, testData.organization.id, testData.adminUser.id);

    if (complexCategoryResult.status !== 200) {
      throw new Error(`Failed to create complex category: ${complexCategoryResult.body.message}`);
    }
    complexCategory = complexCategoryResult.body;

    const workoutCategoryResult = await workoutCategoryUseCase.create({ 
      name: 'Workouts Haltérophilie' 
    }, testData.organization.id, testData.adminUser.id);

    if (workoutCategoryResult.status !== 200) {
      throw new Error(`Failed to create workout category: ${workoutCategoryResult.body.message}`);
    }
    workoutCategory = workoutCategoryResult.body;
    
    expect(workoutCategory).toBeDefined();
    expect(workoutCategory.id).toBeDefined();
    expect(workoutCategory.name).toBe('Workouts Haltérophilie');

    // Test 1: Créer des exercices et un complex
    console.log('🧪 Testing exercise and complex creation for workouts...');
    const exercise1Result = await exerciseUseCase.create({
      name: 'Squat',
      description: 'Basic squat exercise',
      exerciseCategory: exerciseCategory.id,
    }, testData.organization.id, testData.adminUser.id);

    const exercise2Result = await exerciseUseCase.create({
      name: 'Deadlift',
      description: 'Basic deadlift exercise',
      exerciseCategory: exerciseCategory.id,
    }, testData.organization.id, testData.adminUser.id);

    if (exercise1Result.status !== 200 || exercise2Result.status !== 200) {
      throw new Error('Failed to create exercises');
    }

    const exercise1 = exercise1Result.body;
    const exercise2 = exercise2Result.body;

    const complexResult = await complexUseCase.create({
      name: 'Complex Test',
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

    if (complexResult.status !== 200) {
      throw new Error(`Failed to create complex: ${complexResult.body.message}`);
    }

    const complex = complexResult.body;

    expect(exercise1).toBeDefined();
    expect(exercise2).toBeDefined();
    expect(complex).toBeDefined();

    // Test 2: Créer un workout via use case
    console.log('🧪 Testing workout creation via use case...');
    const workout1Result = await workoutUseCase.createWorkout({
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

    if (workout1Result.status !== 200) {
      throw new Error(`Failed to create workout1: ${workout1Result.body.message}`);
    }

    const workout1 = workout1Result.body;
    expect(workout1).toBeDefined();
    expect(workout1.id).toBeDefined();
    expect(workout1.title).toBe('Test Workout');
    expect(workout1.elements).toHaveLength(2);

    // Vérification du complex
    const complexElement = workout1.elements[0] as { type: string; complex: { exercises: { id: string; name: string }[] } };
    expect(complexElement.type).toBe('complex');
    expect(complexElement.complex).toBeDefined();
    expect(complexElement.complex.exercises).toBeDefined();
    expect(complexElement.complex.exercises.length).toBeGreaterThan(0);

    // Vérification de l'exercice simple
    const exerciseElement = workout1.elements[1] as { type: string; exercise: { id: string; name: string }; reps: number; sets: number; rest: number; startWeight_percent: number };
    expect(exerciseElement.type).toBe('exercise');
    expect(exerciseElement.exercise).toBeDefined();
    expect(exerciseElement.reps).toBe(8);
    expect(exerciseElement.sets).toBe(3);
    expect(exerciseElement.rest).toBe(90);
    expect(exerciseElement.startWeight_percent).toBe(70);

    // Test 3: Créer un autre workout
    console.log('🧪 Testing second workout creation via use case...');
    const workout2Result = await workoutUseCase.createWorkout({
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

    if (workout2Result.status !== 200) {
      throw new Error(`Failed to create workout2: ${workout2Result.body.message}`);
    }

    const workout2 = workout2Result.body;
    expect(workout2).toBeDefined();
    expect(workout2.title).toBe('Second Workout');
    expect(workout2.elements).toHaveLength(1);

    // Test 4: Récupérer tous les workouts via use case
    console.log('🧪 Testing workout retrieval via use case...');
    const workoutsResult = await workoutUseCase.getWorkouts(testData.organization.id, testData.adminUser.id);
    
    if (workoutsResult.status !== 200) {
      throw new Error(`Failed to get workouts: ${workoutsResult.body.message}`);
    }

    const workouts = workoutsResult.body;
    expect(workouts.length).toBeGreaterThanOrEqual(2);

    // Test 5: Récupérer un workout spécifique
    console.log('🧪 Testing single workout retrieval via use case...');
    const singleWorkoutResult = await workoutUseCase.getWorkout(workout1.id, testData.organization.id, testData.adminUser.id);
    
    if (singleWorkoutResult.status !== 200) {
      throw new Error(`Failed to get single workout: ${singleWorkoutResult.body.message}`);
    }

    const singleWorkout = singleWorkoutResult.body;
    expect(singleWorkout.id).toBe(workout1.id);
    expect(singleWorkout.title).toBe('Test Workout');

    // Test 6: Mettre à jour un workout via use case
    console.log('🧪 Testing workout update via use case...');
    const updatedWorkoutResult = await workoutUseCase.updateWorkout(
      workout1.id,
      {
        title: 'Test Workout Modifié',
        description: 'Description modifiée',
      },
      testData.organization.id,
      testData.adminUser.id
    );

    if (updatedWorkoutResult.status !== 200) {
      throw new Error(`Failed to update workout: ${updatedWorkoutResult.body.message}`);
    }

    const updatedWorkout = updatedWorkoutResult.body;
    expect(updatedWorkout.title).toBe('Test Workout Modifié');
    expect(updatedWorkout.description).toBe('Description modifiée');

    // Test 7: Supprimer un workout via use case
    console.log('🧪 Testing workout deletion via use case...');
    const deleteResult = await workoutUseCase.deleteWorkout(workout2.id, testData.organization.id, testData.adminUser.id);
    
    if (deleteResult.status !== 200) {
      throw new Error(`Failed to delete workout: ${deleteResult.body.message}`);
    }

    const remainingWorkoutsResult = await workoutUseCase.getWorkouts(testData.organization.id, testData.adminUser.id);
    
    if (remainingWorkoutsResult.status !== 200) {
      throw new Error(`Failed to get remaining workouts: ${remainingWorkoutsResult.body.message}`);
    }

    const remainingWorkouts = remainingWorkoutsResult.body;
    expect(remainingWorkouts.length).toBe(workouts.length - 1);

    console.log('✅ Workout integration tests completed successfully');

  } catch (error) {
    console.error('❌ Workout integration tests failed:', error);
    throw error;
  }
} 