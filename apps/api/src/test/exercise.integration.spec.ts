import { CreateExercise, ExerciseCategoryDto, ExerciseDto } from '@dropit/schemas';
import { MikroORM } from '@mikro-orm/core';
import { ExerciseCategoryUseCase } from '../modules/training/application/use-cases/exercise-category.use-cases';
import { ExerciseUseCase } from '../modules/training/application/use-cases/exercise.use-cases';
import { OrganizationUseCases } from '../modules/identity/application/organization.use-cases';
import { setupOrganization } from './organization.integration.spec';
import { cleanDatabase, TestData } from './utils/test-setup';
import { TestUseCaseFactory } from './utils/test-use-cases';

/**
 * Exécute les tests d'intégration pour les exercices
 */
export async function runExerciseTests(orm: MikroORM): Promise<void> {
  console.log('📋 Running exercise integration tests...');
  
  let exerciseCategoryUseCase: ExerciseCategoryUseCase;
  let exerciseUseCase: ExerciseUseCase;
  let organizationUseCases: OrganizationUseCases;
  let testData: TestData;
  let exerciseCategory: ExerciseCategoryDto;

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

    // Créer une catégorie d'exercice via use case
    const exerciseCategoryResult = await exerciseCategoryUseCase.create({ 
      name: 'Haltérophilie' 
    }, testData.organization.id, testData.adminUser.id);
    
    if (exerciseCategoryResult.status === 200) {
      exerciseCategory = exerciseCategoryResult.body;
    } else {
      throw new Error(`Failed to create exercise category: ${exerciseCategoryResult.body.message}`);
    }
    
    expect(exerciseCategory).toBeDefined();
    expect(exerciseCategory.id).toBeDefined();
    expect(exerciseCategory.name).toBe('Haltérophilie');

    // Test 1: Créer des exercices via use case
    console.log('🧪 Testing exercise creation via use case...');
    const exercise1Result = await exerciseUseCase.create({
      name: 'Squat',
      description: 'Basic squat exercise',
      exerciseCategory: exerciseCategory.id,
    }, testData.organization.id, testData.adminUser.id);

    if (exercise1Result.status !== 201) {
      throw new Error(`Failed to create exercise1: ${exercise1Result.body.message}`);
    }

    const exercise1 = exercise1Result.body;
    expect(exercise1).toBeDefined();
    expect(exercise1.id).toBeDefined();
    expect(exercise1.name).toBe('Squat');
    expect(exercise1.exerciseCategory.name).toBe('Haltérophilie');

    const exercise2Result = await exerciseUseCase.create({
      name: 'Push-up',
      description: 'Basic push-up',
      exerciseCategory: exerciseCategory.id,
    }, testData.organization.id, testData.adminUser.id);

    if (exercise2Result.status !== 201) {
      throw new Error(`Failed to create exercise2: ${exercise2Result.body.message}`);
    }

    const exercise2 = exercise2Result.body;
    expect(exercise2).toBeDefined();
    expect(exercise2.name).toBe('Push-up');

    const exercise3Result = await exerciseUseCase.create({
      name: 'Squat Clavicule',
      description: 'Squat avec barre en position clavicule',
      exerciseCategory: exerciseCategory.id,
      englishName: 'Front Squat',
      shortName: 'FS',
    }, testData.organization.id, testData.adminUser.id);

    if (exercise3Result.status !== 201) {
      throw new Error(`Failed to create exercise3: ${exercise3Result.body.message}`);
    }

    const exercise3 = exercise3Result.body;
    expect(exercise3).toBeDefined();
    expect(exercise3.name).toBe('Squat Clavicule');
    expect(exercise3.englishName).toBe('Front Squat');
    expect(exercise3.shortName).toBe('FS');

    // Test 2: Récupérer des exercices via use case
    console.log('🧪 Testing exercise retrieval via use case...');
    const exercisesResult = await exerciseUseCase.getAll(testData.organization.id, testData.adminUser.id);
    
    if (exercisesResult.status !== 200) {
      throw new Error(`Failed to get exercises: ${exercisesResult.body.message}`);
    }

    const exercises = exercisesResult.body;
    expect(exercises.length).toBeGreaterThanOrEqual(3);

    // Test 3: Récupérer un exercice spécifique
    console.log('🧪 Testing single exercise retrieval via use case...');
    const singleExerciseResult = await exerciseUseCase.getOne(exercise1.id, testData.organization.id, testData.adminUser.id);
    
    if (singleExerciseResult.status !== 200) {
      throw new Error(`Failed to get single exercise: ${singleExerciseResult.body.message}`);
    }

    const singleExercise = singleExerciseResult.body;
    expect(singleExercise.id).toBe(exercise1.id);
    expect(singleExercise.name).toBe('Squat');

    // Test 4: Mettre à jour un exercice via use case
    console.log('🧪 Testing exercise update via use case...');
    const updatedExerciseResult = await exerciseUseCase.update(
      exercise1.id,
      {
        name: 'Squat Modifié',
        description: 'Description modifiée',
      },
      testData.organization.id,
      testData.adminUser.id
    );

    if (updatedExerciseResult.status !== 200) {
      throw new Error(`Failed to update exercise: ${updatedExerciseResult.body.message}`);
    }

    const updatedExercise = updatedExerciseResult.body;
    expect(updatedExercise.name).toBe('Squat Modifié');
    expect(updatedExercise.description).toBe('Description modifiée');

    // Test 5: Rechercher des exercices via use case
    console.log('🧪 Testing exercise search via use case...');
    const searchResultsResult = await exerciseUseCase.search('Squat', testData.organization.id, testData.adminUser.id);
    
    if (searchResultsResult.status !== 200) {
      throw new Error(`Failed to search exercises: ${searchResultsResult.body.message}`);
    }

    const searchResults = searchResultsResult.body;
    expect(searchResults.length).toBeGreaterThanOrEqual(2); // Squat + Squat Clavicule

    // Test 6: Supprimer un exercice via use case
    console.log('🧪 Testing exercise deletion via use case...');
    const deleteResult = await exerciseUseCase.delete(exercise2.id, testData.organization.id, testData.adminUser.id);
    
    if (deleteResult.status !== 200) {
      throw new Error(`Failed to delete exercise: ${deleteResult.body.message}`);
    }

    const remainingExercisesResult = await exerciseUseCase.getAll(testData.organization.id, testData.adminUser.id);
    
    if (remainingExercisesResult.status !== 200) {
      throw new Error(`Failed to get remaining exercises: ${remainingExercisesResult.body.message}`);
    }

    const remainingExercises = remainingExercisesResult.body;
    expect(remainingExercises.length).toBe(exercises.length - 1);

    console.log('✅ Exercise integration tests completed successfully');

  } catch (error) {
    console.error('❌ Exercise integration tests failed:', error);
    throw error;
  }
} 