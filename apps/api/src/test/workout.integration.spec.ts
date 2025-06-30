import { ComplexCategoryDto, ExerciseCategoryDto, WorkoutCategoryDto } from '@dropit/schemas';
import { MikroORM } from '@mikro-orm/core';
import { ComplexCategoryService } from '../modules/training/complex-category/complex-category.service';
import { ComplexService } from '../modules/training/complex/complex.service';
import { ExerciseCategoryService } from '../modules/training/exercise-category/exercise-category.service';
import { ExerciseService } from '../modules/training/exercise/exercise.service';
import { WorkoutCategoryService } from '../modules/training/workout-category/workout-category.service';
import { WorkoutService } from '../modules/training/workout/workout.service';
import { OrganizationService } from '../modules/members/organization/organization.service';
import { WORKOUT_ELEMENT_TYPES } from '../modules/training/workout-element/workout-element.entity';
import { setupOrganization } from './organization.integration.spec';
import { cleanDatabase, TestData } from './utils/test-setup';

/**
 * Exécute les tests d'intégration pour les workouts
 */
export async function runWorkoutTests(orm: MikroORM): Promise<void> {
  console.log('📋 Running workout integration tests...');
  
  let exerciseCategoryService: ExerciseCategoryService;
  let exerciseService: ExerciseService;
  let complexCategoryService: ComplexCategoryService;
  let complexService: ComplexService;
  let workoutCategoryService: WorkoutCategoryService;
  let workoutService: WorkoutService;
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
    
    // Créer les services directement
    organizationService = new OrganizationService(orm.em);
    exerciseCategoryService = new ExerciseCategoryService(orm.em);
    exerciseService = new ExerciseService(orm.em, organizationService);
    complexCategoryService = new ComplexCategoryService(orm.em);
    complexService = new ComplexService(orm.em, organizationService);
    workoutCategoryService = new WorkoutCategoryService(orm.em);
    workoutService = new WorkoutService(orm.em, organizationService);

    // Créer les catégories
    exerciseCategory = await exerciseCategoryService.createExerciseCategory({ 
      name: 'Haltérophilie' 
    });

    complexCategory = await complexCategoryService.createComplexCategory({ 
      name: 'Complexes Haltérophilie' 
    });

    workoutCategory = await workoutCategoryService.createWorkoutCategory({ 
      name: 'Workouts Haltérophilie' 
    });
    
    expect(workoutCategory).toBeDefined();
    expect(workoutCategory.id).toBeDefined();
    expect(workoutCategory.name).toBe('Workouts Haltérophilie');

    // Test 1: Créer des exercices et un complex
    console.log('🧪 Testing exercise and complex creation for workouts...');
    const exercise1 = await exerciseService.createExercise({
      name: 'Squat',
      description: 'Basic squat exercise',
      exerciseCategory: exerciseCategory.id,
    }, testData.adminUser.id);

    const exercise2 = await exerciseService.createExercise({
      name: 'Deadlift',
      description: 'Basic deadlift exercise',
      exerciseCategory: exerciseCategory.id,
    }, testData.adminUser.id);

    const complex = await complexService.createComplex({
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

    expect(exercise1).toBeDefined();
    expect(exercise2).toBeDefined();
    expect(complex).toBeDefined();

    // Test 2: Créer un workout via service
    console.log('🧪 Testing workout creation via service...');
    const workout1 = await workoutService.createWorkout({
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
    console.log('🧪 Testing second workout creation via service...');
    const workout2 = await workoutService.createWorkout({
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

    expect(workout2).toBeDefined();
    expect(workout2.title).toBe('Second Workout');
    expect(workout2.elements).toHaveLength(1);

    // Test 4: Récupérer tous les workouts via service
    console.log('🧪 Testing workout retrieval via service...');
    const workouts = await workoutService.getWorkouts(testData.organization.id);
    expect(workouts.length).toBeGreaterThanOrEqual(2);

    // Test 5: Récupérer un workout spécifique
    console.log('🧪 Testing single workout retrieval via service...');
    const singleWorkout = await workoutService.getWorkout(workout1.id, testData.organization.id);
    expect(singleWorkout.id).toBe(workout1.id);
    expect(singleWorkout.title).toBe('Test Workout');

    // Test 6: Mettre à jour un workout via service
    console.log('🧪 Testing workout update via service...');
    const updatedWorkout = await workoutService.updateWorkout(
      workout1.id,
      {
        title: 'Test Workout Modifié',
        description: 'Description modifiée',
      },
      testData.organization.id
    );

    expect(updatedWorkout.title).toBe('Test Workout Modifié');
    expect(updatedWorkout.description).toBe('Description modifiée');

    // Test 7: Supprimer un workout via service
    console.log('🧪 Testing workout deletion via service...');
    await workoutService.deleteWorkout(workout2.id, testData.organization.id);

    const remainingWorkouts = await workoutService.getWorkouts(testData.organization.id);
    expect(remainingWorkouts.length).toBe(workouts.length - 1);

    console.log('✅ Workout integration tests completed successfully');

  } catch (error) {
    console.error('❌ Workout integration tests failed:', error);
    throw error;
  }
} 