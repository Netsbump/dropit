import { ExerciseCategoryDto, ComplexCategoryDto } from '@dropit/schemas';
import { MikroORM } from '@mikro-orm/core';
import { ComplexCategoryService } from '../modules/training/application/use-cases/complex-category.use-cases';
import { ComplexService } from '../modules/training/application/use-cases/complex.use-cases';
import { ExerciseCategoryService } from '../modules/training/exercise-category/exercise-category.service';
import { ExerciseService } from '../modules/training/exercise/exercise.service';
import { OrganizationService } from '../modules/identity/organization/organization.service';
import { setupOrganization } from './organization.integration.spec';
import { cleanDatabase, TestData } from './utils/test-setup';

/**
 * Exécute les tests d'intégration pour les complexes
 */
export async function runComplexTests(orm: MikroORM): Promise<void> {
  console.log('📋 Running complex integration tests...');
  
  let exerciseCategoryService: ExerciseCategoryService;
  let exerciseService: ExerciseService;
  let complexCategoryService: ComplexCategoryService;
  let complexService: ComplexService;
  let organizationService: OrganizationService;
  let testData: TestData;
  let exerciseCategory: ExerciseCategoryDto;
  let complexCategory: ComplexCategoryDto;

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

    // Créer une catégorie d'exercice
    exerciseCategory = await exerciseCategoryService.createExerciseCategory({ 
      name: 'Haltérophilie' 
    });

    // Créer une catégorie de complex
    complexCategory = await complexCategoryService.createComplexCategory({ 
      name: 'Complexes Haltérophilie' 
    });
    
    expect(complexCategory).toBeDefined();
    expect(complexCategory.id).toBeDefined();
    expect(complexCategory.name).toBe('Complexes Haltérophilie');

    // Test 1: Créer des exercices pour les complexes
    console.log('🧪 Testing exercise creation for complexes...');
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

    const exercise3 = await exerciseService.createExercise({
      name: 'Bench Press',
      description: 'Basic bench press exercise',
      exerciseCategory: exerciseCategory.id,
    }, testData.adminUser.id);

    expect(exercise1).toBeDefined();
    expect(exercise2).toBeDefined();
    expect(exercise3).toBeDefined();

    // Test 2: Créer un complex via service
    console.log('🧪 Testing complex creation via service...');
    const complex1 = await complexService.createComplex({
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

    expect(complex1).toBeDefined();
    expect(complex1.id).toBeDefined();
    expect(complex1.name).toBe('Arraché simple');
    expect(complex1.exercises).toHaveLength(3);

    // Test 3: Créer un autre complex
    console.log('🧪 Testing second complex creation via service...');
    const exercise4 = await exerciseService.createExercise({
      name: 'Push-up',
      description: 'Basic push-up',
      exerciseCategory: exerciseCategory.id,
    }, testData.adminUser.id);

    const exercise5 = await exerciseService.createExercise({
      name: 'Pull-up',
      description: 'Basic pull-up',
      exerciseCategory: exerciseCategory.id,
    }, testData.adminUser.id);

    const complex2 = await complexService.createComplex({
      name: 'Complex Push-Pull',
      description: 'Complexe push-pull',
      complexCategory: complexCategory.id,
      exercises: [
        { exerciseId: exercise4.id, order: 1, reps: 10 },
        { exerciseId: exercise5.id, order: 2, reps: 8 },
      ],
    }, testData.organization.id, testData.adminUser.id);

    expect(complex2).toBeDefined();
    expect(complex2.name).toBe('Complex Push-Pull');
    expect(complex2.exercises).toHaveLength(2);

    // Test 4: Récupérer tous les complexes via service
    console.log('🧪 Testing complex retrieval via service...');
    const complexes = await complexService.getComplexes(testData.organization.id);
    expect(complexes.length).toBeGreaterThanOrEqual(2);

    // Test 5: Récupérer un complex spécifique
    console.log('🧪 Testing single complex retrieval via service...');
    const singleComplex = await complexService.getComplex(complex1.id, testData.organization.id);
    expect(singleComplex.id).toBe(complex1.id);
    expect(singleComplex.name).toBe('Arraché simple');

    // Test 6: Mettre à jour un complex via service
    console.log('🧪 Testing complex update via service...');
    const updatedComplex = await complexService.updateComplex(
      complex1.id,
      {
        name: 'Arraché simple Modifié',
        description: 'Description modifiée',
      },
      testData.organization.id
    );

    expect(updatedComplex.name).toBe('Arraché simple Modifié');
    expect(updatedComplex.description).toBe('Description modifiée');

    // Test 7: Supprimer un complex via service
    console.log('🧪 Testing complex deletion via service...');
    await complexService.deleteComplex(complex2.id, testData.organization.id);

    const remainingComplexes = await complexService.getComplexes(testData.organization.id);
    expect(remainingComplexes.length).toBe(complexes.length - 1);

    console.log('✅ Complex integration tests completed successfully');

  } catch (error) {
    console.error('❌ Complex integration tests failed:', error);
    throw error;
  }
} 