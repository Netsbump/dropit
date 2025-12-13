import { MikroORM } from '@mikro-orm/core';
import { ComplexCategoryUseCase } from '../modules/training/application/use-cases/complex-category.use-cases';
import { ComplexUseCase } from '../modules/training/application/use-cases/complex.use-cases';
import { ExerciseCategoryUseCase } from '../modules/training/application/use-cases/exercise-category.use-cases';
import { ExerciseUseCase } from '../modules/training/application/use-cases/exercise.use-cases';
import { OrganizationUseCases } from '../modules/identity/application/organization.use-cases';
import { Exercise } from '../modules/training/domain/exercise.entity';
import { ExerciseCategory } from '../modules/training/domain/exercise-category.entity';
import { Complex } from '../modules/training/domain/complex.entity';
import { ComplexCategory } from '../modules/training/domain/complex-category.entity';
import { setupOrganization } from './organization.integration';
import { cleanDatabase, TestData } from './utils/test-setup';
import { TestUseCaseFactory } from './utils/test-use-cases';

/**
 * Exécute les tests d'intégration pour les complexes
 */
export async function runComplexTests(orm: MikroORM): Promise<void> {
  console.log('📋 Running complex integration tests...');
  
  let organizationUseCases: OrganizationUseCases;
  let exerciseCategoryUseCase: ExerciseCategoryUseCase;
  let exerciseUseCase: ExerciseUseCase;
  let complexCategoryUseCase: ComplexCategoryUseCase;
  let complexUseCase: ComplexUseCase;
  let testData: TestData;
  let exerciseCategory: ExerciseCategory;
  let complexCategory: ComplexCategory;

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
    try {
      exerciseCategory = await exerciseCategoryUseCase.create({ 
        name: 'Haltérophilie' 
      }, testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to create exercise category: ${(error as Error).message}`);
    }

    // Créer une catégorie de complex via use case
    try {
      complexCategory = await complexCategoryUseCase.create({ 
        name: 'Complexes Haltérophilie' 
      }, testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to create complex category: ${(error as Error).message}`);
    }
    
    expect(complexCategory).toBeDefined();
    expect(complexCategory.id).toBeDefined();
    expect(complexCategory.name).toBe('Complexes Haltérophilie');

    // Test 1: Créer des exercices pour les complexes via use case
    console.log('🧪 Testing exercise creation for complexes...');
    let exercise1: Exercise;
    let exercise2: Exercise;
    let exercise3: Exercise;
    try {
      exercise1 = await exerciseUseCase.create({
        name: 'Squat',
        exerciseCategory: exerciseCategory.id,
      }, testData.organization.id, testData.adminUser.id);

      exercise2 = await exerciseUseCase.create({
        name: 'Deadlift',
        exerciseCategory: exerciseCategory.id,
      }, testData.organization.id, testData.adminUser.id);

      exercise3 = await exerciseUseCase.create({
        name: 'Bench Press',
        exerciseCategory: exerciseCategory.id,
      }, testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to create exercises: ${(error as Error).message}`);
    }

    expect(exercise1).toBeDefined();
    expect(exercise2).toBeDefined();
    expect(exercise3).toBeDefined();

    // Test 2: Créer un complex via use case
    console.log('🧪 Testing complex creation via use case...');
    let complex1: Complex;
    try {
      complex1 = await complexUseCase.create({
        complexCategory: complexCategory.id,
        exercises: [
          {
            exerciseId: exercise1.id,
            order: 1,
          },
          {
            exerciseId: exercise2.id,
            order: 2,
          },
          {
            exerciseId: exercise3.id,
            order: 3,
          },
        ],
      }, testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to create complex: ${(error as Error).message}`);
    }

    expect(complex1).toBeDefined();
    expect(complex1.id).toBeDefined();
    expect(complex1.exercises).toHaveLength(3);

    // Test 3: Créer un autre complex
    console.log('🧪 Testing second complex creation via use case...');
    let exercise4: Exercise;
    let exercise5: Exercise;
    let complex2: Complex;
    try {
      exercise4 = await exerciseUseCase.create({
        name: 'Push-up',
        exerciseCategory: exerciseCategory.id,
      }, testData.organization.id, testData.adminUser.id);

      exercise5 = await exerciseUseCase.create({
        name: 'Pull-up',
        exerciseCategory: exerciseCategory.id,
      }, testData.organization.id, testData.adminUser.id);

      complex2 = await complexUseCase.create({
        complexCategory: complexCategory.id,
        exercises: [
          { exerciseId: exercise4.id, order: 1 },
          { exerciseId: exercise5.id, order: 2 },
        ],
      }, testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to create second complex: ${(error as Error).message}`);
    }

    expect(complex2).toBeDefined();
    expect(complex2.exercises).toHaveLength(2);

    // Test 4: Récupérer tous les complexes via use case
    console.log('🧪 Testing complex retrieval via use case...');
    let complexes: Complex[];
    try {
      complexes = await complexUseCase.getAll(testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to get complexes: ${(error as Error).message}`);
    }
    expect(complexes.length).toBeGreaterThanOrEqual(2);

    // Test 5: Récupérer un complex spécifique
    console.log('🧪 Testing single complex retrieval via use case...');
    let singleComplex: Complex;
    try {
      singleComplex = await complexUseCase.getOne(complex1.id, testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to get single complex: ${(error as Error).message}`);
    }
    expect(singleComplex.id).toBe(complex1.id);

    // Test 6: Mettre à jour un complex via use case
    console.log('🧪 Testing complex update via use case...');
    let updatedComplex: Complex;
    try {
      updatedComplex = await complexUseCase.update(
        complex1.id,
        {
          exercises: [
            {
              exerciseId: exercise1.id,
              order: 1,
            },
            {
              exerciseId: exercise2.id,
              order: 2,
            },
          ],
        },
        testData.organization.id,
        testData.adminUser.id
      );
    } catch (error: unknown) {
      throw new Error(`Failed to update complex: ${(error as Error).message}`);
    }
    expect(updatedComplex.exercises).toHaveLength(2);

    // Test 7: Supprimer un complex via use case
    console.log('🧪 Testing complex deletion via use case...');
    try {
      await complexUseCase.delete(complex2.id, testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to delete complex: ${(error as Error).message}`);
    }

    let remainingComplexes: Complex[];
    try {
      remainingComplexes = await complexUseCase.getAll(testData.organization.id, testData.adminUser.id);
    } catch (error: unknown) {
      throw new Error(`Failed to get remaining complexes: ${(error as Error).message}`);
    }
    expect(remainingComplexes.length).toBe(complexes.length - 1);

    console.log('✅ Complex integration tests completed successfully');

  } catch (error) {
    console.error('❌ Complex integration tests failed:', error);
    throw error;
  }
} 