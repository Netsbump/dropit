import { ExerciseCategoryDto, ComplexCategoryDto } from '@dropit/schemas';
import { MikroORM } from '@mikro-orm/core';
import { ComplexCategoryUseCase } from '../modules/training/application/use-cases/complex-category.use-cases';
import { ComplexUseCase } from '../modules/training/application/use-cases/complex.use-cases';
import { ExerciseCategoryUseCase } from '../modules/training/application/use-cases/exercise-category.use-cases';
import { ExerciseUseCase } from '../modules/training/application/use-cases/exercise.use-cases';
import { OrganizationUseCases } from '../modules/identity/application/organization.use-cases';
import { setupOrganization } from './organization.integration.spec';
import { cleanDatabase, TestData } from './utils/test-setup';
import { TestUseCaseFactory } from './utils/test-use-cases';

/**
 * Exécute les tests d'intégration pour les complexes
 */
export async function runComplexTests(orm: MikroORM): Promise<void> {
  console.log('📋 Running complex integration tests...');
  
  let exerciseCategoryUseCase: ExerciseCategoryUseCase;
  let exerciseUseCase: ExerciseUseCase;
  let complexCategoryUseCase: ComplexCategoryUseCase;
  let complexUseCase: ComplexUseCase;
  let organizationUseCases: OrganizationUseCases;
  let testData: TestData;
  let exerciseCategory: ExerciseCategoryDto;
  let complexCategory: ComplexCategoryDto;

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

    // Créer une catégorie d'exercice via use case
    const exerciseCategoryResult = await exerciseCategoryUseCase.create({ 
      name: 'Haltérophilie' 
    }, testData.organization.id, testData.adminUser.id);
    
    if (exerciseCategoryResult.status === 200) {
      exerciseCategory = exerciseCategoryResult.body;
    } else {
      throw new Error(`Failed to create exercise category: ${exerciseCategoryResult.body.message}`);
    }

    // Créer une catégorie de complex via use case
    const complexCategoryResult = await complexCategoryUseCase.create({ 
      name: 'Complexes Haltérophilie' 
    }, testData.organization.id, testData.adminUser.id);
    
    if (complexCategoryResult.status === 200) {
      complexCategory = complexCategoryResult.body;
    } else {
      throw new Error(`Failed to create complex category: ${complexCategoryResult.body.message}`);
    }
    
    expect(complexCategory).toBeDefined();
    expect(complexCategory.id).toBeDefined();
    expect(complexCategory.name).toBe('Complexes Haltérophilie');

    // Test 1: Créer des exercices pour les complexes via use case
    console.log('🧪 Testing exercise creation for complexes...');
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

    const exercise3Result = await exerciseUseCase.create({
      name: 'Bench Press',
      description: 'Basic bench press exercise',
      exerciseCategory: exerciseCategory.id,
    }, testData.organization.id, testData.adminUser.id);

    if (exercise1Result.status !== 200 || exercise2Result.status !== 200 || exercise3Result.status !== 200) {
      throw new Error('Failed to create exercises');
    }

    const exercise1 = exercise1Result.body;
    const exercise2 = exercise2Result.body;
    const exercise3 = exercise3Result.body;

    expect(exercise1).toBeDefined();
    expect(exercise2).toBeDefined();
    expect(exercise3).toBeDefined();

    // Test 2: Créer un complex via use case
    console.log('🧪 Testing complex creation via use case...');
    const complex1Result = await complexUseCase.create({
      name: 'Arraché simple',
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
        {
          exerciseId: exercise3.id,
          order: 3,
          reps: 10,
        },
      ],
      description: 'Pour monter en gamme tranquillement',
    }, testData.organization.id, testData.adminUser.id);

    if (complex1Result.status !== 200) {
      throw new Error(`Failed to create complex: ${complex1Result.body.message}`);
    }

    const complex1 = complex1Result.body;

    expect(complex1).toBeDefined();
    expect(complex1.id).toBeDefined();
    expect(complex1.name).toBe('Arraché simple');
    expect(complex1.exercises).toHaveLength(3);

    // Test 3: Créer un autre complex
    console.log('🧪 Testing second complex creation via use case...');
    const exercise4Result = await exerciseUseCase.create({
      name: 'Push-up',
      description: 'Basic push-up',
      exerciseCategory: exerciseCategory.id,
    }, testData.organization.id, testData.adminUser.id);

    const exercise5Result = await exerciseUseCase.create({
      name: 'Pull-up',
      description: 'Basic pull-up',
      exerciseCategory: exerciseCategory.id,
    }, testData.organization.id, testData.adminUser.id);

    if (exercise4Result.status !== 200 || exercise5Result.status !== 200) {
      throw new Error('Failed to create exercises for second complex');
    }

    const exercise4 = exercise4Result.body;
    const exercise5 = exercise5Result.body;

    const complex2Result = await complexUseCase.create({
      name: 'Complex Push-Pull',
      description: 'Complexe push-pull',
      complexCategory: complexCategory.id,
      exercises: [
        { exerciseId: exercise4.id, order: 1, reps: 10 },
        { exerciseId: exercise5.id, order: 2, reps: 8 },
      ],
    }, testData.organization.id, testData.adminUser.id);

    if (complex2Result.status !== 200) {
      throw new Error(`Failed to create second complex: ${complex2Result.body.message}`);
    }

    const complex2 = complex2Result.body;

    expect(complex2).toBeDefined();
    expect(complex2.name).toBe('Complex Push-Pull');
    expect(complex2.exercises).toHaveLength(2);

    // Test 4: Récupérer tous les complexes via use case
    console.log('🧪 Testing complex retrieval via use case...');
    const complexesResult = await complexUseCase.getAll(testData.organization.id, testData.adminUser.id);
    
    if (complexesResult.status !== 200) {
      throw new Error(`Failed to get complexes: ${complexesResult.body.message}`);
    }

    const complexes = complexesResult.body;
    expect(complexes.length).toBeGreaterThanOrEqual(2);

    // Test 5: Récupérer un complex spécifique
    console.log('🧪 Testing single complex retrieval via use case...');
    const singleComplexResult = await complexUseCase.getOne(complex1.id, testData.organization.id, testData.adminUser.id);
    
    if (singleComplexResult.status !== 200) {
      throw new Error(`Failed to get single complex: ${singleComplexResult.body.message}`);
    }

    const singleComplex = singleComplexResult.body;
    expect(singleComplex.id).toBe(complex1.id);
    expect(singleComplex.name).toBe('Arraché simple');

    // Test 6: Mettre à jour un complex via use case
    console.log('🧪 Testing complex update via use case...');
    const updatedComplexResult = await complexUseCase.update(
      complex1.id,
      {
        name: 'Arraché simple Modifié',
        description: 'Description modifiée',
      },
      testData.organization.id,
      testData.adminUser.id
    );

    if (updatedComplexResult.status !== 200) {
      throw new Error(`Failed to update complex: ${updatedComplexResult.body.message}`);
    }

    const updatedComplex = updatedComplexResult.body;
    expect(updatedComplex.name).toBe('Arraché simple Modifié');
    expect(updatedComplex.description).toBe('Description modifiée');

    // Test 7: Supprimer un complex via use case
    console.log('🧪 Testing complex deletion via use case...');
    const deleteResult = await complexUseCase.delete(complex2.id, testData.organization.id, testData.adminUser.id);
    
    if (deleteResult.status !== 200) {
      throw new Error(`Failed to delete complex: ${deleteResult.body.message}`);
    }

    const remainingComplexesResult = await complexUseCase.getAll(testData.organization.id, testData.adminUser.id);
    
    if (remainingComplexesResult.status !== 200) {
      throw new Error(`Failed to get remaining complexes: ${remainingComplexesResult.body.message}`);
    }

    const remainingComplexes = remainingComplexesResult.body;
    expect(remainingComplexes.length).toBe(complexes.length - 1);

    console.log('✅ Complex integration tests completed successfully');

  } catch (error) {
    console.error('❌ Complex integration tests failed:', error);
    throw error;
  }
} 