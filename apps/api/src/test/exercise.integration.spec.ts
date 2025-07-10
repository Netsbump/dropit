import { CreateExercise, ExerciseCategoryDto, ExerciseDto } from '@dropit/schemas';
import { MikroORM } from '@mikro-orm/core';
import { ExerciseCategoryService } from '../modules/training/exercise-category/exercise-category.service';
import { ExerciseService } from '../modules/training/exercise/exercise.service';
import { OrganizationService } from '../modules/identity/organization/organization.service';
import { setupOrganization } from './organization.integration.spec';
import { cleanDatabase, TestData } from './utils/test-setup';

/**
 * Exécute les tests d'intégration pour les exercices
 */
export async function runExerciseTests(orm: MikroORM): Promise<void> {
  console.log('📋 Running exercise integration tests...');
  
  let exerciseCategoryService: ExerciseCategoryService;
  let exerciseService: ExerciseService;
  let organizationService: OrganizationService;
  let testData: TestData;
  let exerciseCategory: ExerciseCategoryDto;

  try {
    // Nettoyer la base de données
    await cleanDatabase(orm);
    
    // Setup l'organisation (dépendance)
    testData = await setupOrganization(orm);

    // Créer les services directement
    organizationService = new OrganizationService(orm.em);
    exerciseCategoryService = new ExerciseCategoryService(orm.em);
    exerciseService = new ExerciseService(orm.em, organizationService);

    // Créer une catégorie d'exercice
    exerciseCategory = await exerciseCategoryService.createExerciseCategory({ 
      name: 'Haltérophilie' 
    });
    
    expect(exerciseCategory).toBeDefined();
    expect(exerciseCategory.id).toBeDefined();
    expect(exerciseCategory.name).toBe('Haltérophilie');

    // Test 1: Créer des exercices via service
    console.log('🧪 Testing exercise creation via service...');
    const exercise1 = await exerciseService.createExercise({
      name: 'Squat',
      description: 'Basic squat exercise',
      exerciseCategory: exerciseCategory.id,
    }, testData.adminUser.id);

    expect(exercise1).toBeDefined();
    expect(exercise1.id).toBeDefined();
    expect(exercise1.name).toBe('Squat');
    expect(exercise1.exerciseCategory.name).toBe('Haltérophilie');

    const exercise2 = await exerciseService.createExercise({
      name: 'Push-up',
      description: 'Basic push-up',
      exerciseCategory: exerciseCategory.id,
    }, testData.adminUser.id);

    expect(exercise2).toBeDefined();
    expect(exercise2.name).toBe('Push-up');

    const exercise3 = await exerciseService.createExercise({
      name: 'Squat Clavicule',
      description: 'Squat avec barre en position clavicule',
      exerciseCategory: exerciseCategory.id,
      englishName: 'Front Squat',
      shortName: 'FS',
    }, testData.adminUser.id);

    expect(exercise3).toBeDefined();
    expect(exercise3.name).toBe('Squat Clavicule');
    expect(exercise3.englishName).toBe('Front Squat');
    expect(exercise3.shortName).toBe('FS');

    // Test 2: Récupérer des exercices via service
    console.log('🧪 Testing exercise retrieval via service...');
    const exercises = await exerciseService.getExercises(testData.organization.id);
    expect(exercises.length).toBeGreaterThanOrEqual(3);

    // Test 3: Récupérer un exercice spécifique
    console.log('🧪 Testing single exercise retrieval via service...');
    const singleExercise = await exerciseService.getExercise(exercise1.id, testData.organization.id);
    expect(singleExercise.id).toBe(exercise1.id);
    expect(singleExercise.name).toBe('Squat');

    // Test 4: Mettre à jour un exercice via service
    console.log('🧪 Testing exercise update via service...');
    const updatedExercise = await exerciseService.updateExercise(
      exercise1.id,
      {
        name: 'Squat Modifié',
        description: 'Description modifiée',
      },
      testData.organization.id
    );

    expect(updatedExercise.name).toBe('Squat Modifié');
    expect(updatedExercise.description).toBe('Description modifiée');

    // Test 5: Rechercher des exercices via service
    console.log('🧪 Testing exercise search via service...');
    const searchResults = await exerciseService.searchExercises('Squat', testData.organization.id);
    expect(searchResults.length).toBeGreaterThanOrEqual(2); // Squat + Squat Clavicule

    // Test 6: Supprimer un exercice via service
    console.log('🧪 Testing exercise deletion via service...');
    await exerciseService.deleteExercise(exercise2.id, testData.organization.id);

    const remainingExercises = await exerciseService.getExercises(testData.organization.id);
    expect(remainingExercises.length).toBe(exercises.length - 1);

    console.log('✅ Exercise integration tests completed successfully');

  } catch (error) {
    console.error('❌ Exercise integration tests failed:', error);
    throw error;
  }
} 