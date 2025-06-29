import {
  ComplexCategoryDto,
  ComplexDto,
  CreateComplex,
  CreateExercise,
  CreateWorkout,
  ExerciseCategoryDto,
  ExerciseDto,
  WorkoutCategoryDto,
} from '@dropit/schemas';
import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { createTestMikroOrmOptions } from '../config/mikro-orm.config';
import { ComplexCategoryService } from '../modules/training/complex-category/complex-category.service';
import { ComplexService } from '../modules/training/complex/complex.service';
import { ExerciseCategoryService } from '../modules/training/exercise-category/exercise-category.service';
import { ExerciseService } from '../modules/training/exercise/exercise.service';
import { WorkoutCategoryService } from '../modules/training/workout-category/workout-category.service';
import { WORKOUT_ELEMENT_TYPES } from '../modules/training/workout-element/workout-element.entity';

describe('WorkoutController (e2e)', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let workoutCategory: WorkoutCategoryDto;
  let complexCategory: ComplexCategoryDto;
  let exerciseCategory: ExerciseCategoryDto;
  let complex: ComplexDto;
  let exercise1: ExerciseDto;
  let exercise2: ExerciseDto;

  // Déclaration des fonctions utilitaires
  let createWorkoutCategory: (name: string) => Promise<WorkoutCategoryDto>;
  let createComplexCategory: (name: string) => Promise<ComplexCategoryDto>;
  let createExerciseCategory: (name: string) => Promise<ExerciseCategoryDto>;
  let createComplex: (complex: CreateComplex) => Promise<ComplexDto>;
  let createExercise: (exercise: CreateExercise) => Promise<ExerciseDto>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MikroORM)
      .useFactory({
        factory: () => MikroORM.init(createTestMikroOrmOptions()),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    orm = moduleFixture.get<MikroORM>(MikroORM);

    // Nettoyer la base de données avant les tests
    const generator = orm.getSchemaGenerator();
    await generator.refreshDatabase();

    // Initialisation des fonctions utilitaires
    const workoutCategoryService = moduleFixture.get<WorkoutCategoryService>(
      WorkoutCategoryService
    );
    const exerciseCategoryService = moduleFixture.get<ExerciseCategoryService>(
      ExerciseCategoryService
    );
    const exerciseService = moduleFixture.get<ExerciseService>(ExerciseService);
    const complexCategoryService = moduleFixture.get<ComplexCategoryService>(
      ComplexCategoryService
    );
    const complexService = moduleFixture.get<ComplexService>(ComplexService);

    createWorkoutCategory = async (
      name: string
    ): Promise<WorkoutCategoryDto> => {
      return await workoutCategoryService.createWorkoutCategory({ name });
    };

    createExerciseCategory = async (
      name: string
    ): Promise<ExerciseCategoryDto> => {
      return await exerciseCategoryService.createExerciseCategory({ name });
    };

    createComplexCategory = async (
      name: string
    ): Promise<ComplexCategoryDto> => {
      return await complexCategoryService.createComplexCategory({ name });
    };

    createExercise = async (exercise: CreateExercise): Promise<ExerciseDto> => {
      return await exerciseService.createExercise(exercise);
    };

    createComplex = async (complex: CreateComplex): Promise<ComplexDto> => {
      return await complexService.createComplex(complex);
    };

    // Seed de la base de données
    exerciseCategory = await createExerciseCategory('Haltérophilie');
    complexCategory = await createComplexCategory('Complex Arraché');
    workoutCategory = await createWorkoutCategory('Saison');

    // Créer des exercices pour le test
    exercise1 = await createExercise({
      name: 'Squat',
      description: 'Basic squat exercise',
      exerciseCategory: exerciseCategory.id,
    });

    exercise2 = await createExercise({
      name: 'Deadlift',
      description: 'Basic deadlift exercise',
      exerciseCategory: exerciseCategory.id,
    });

    // Créer un complex pour le test
    complex = await createComplex({
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
    });

    await app.init();
  });

  afterAll(async () => {
    await orm.close();
    await app.close();
  });

  describe('/workout', () => {
    it('POST - should create a workout', async () => {
      try {
        const workoutToCreate: CreateWorkout = {
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
        };

        const response = await request(app.getHttpServer())
          .post('/workout')
          .send(workoutToCreate)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(workoutToCreate.title);
        expect(response.body.description).toBe(workoutToCreate.description);
        expect(response.body.elements).toHaveLength(2);

        // Vérification du complex
        const complexElement = response.body.elements[0];
        expect(complexElement.type).toBe('complex');
        expect(complexElement.complex).toBeDefined();
        expect(complexElement.complex.exercises).toBeDefined();
        expect(complexElement.complex.exercises.length).toBeGreaterThan(0);

        // Vérification des exercices du complex
        for (const exercise of complexElement.complex.exercises) {
          expect(exercise).toBeDefined();
          expect(exercise.name).toBeDefined();
          expect(exercise.exerciseCategory).toBeDefined();
          expect(exercise.order).toBeDefined();
          expect(exercise.reps).toBeDefined();
        }

        // Vérification de l'exercice simple
        const exerciseElement = response.body.elements[1];
        expect(exerciseElement.type).toBe('exercise');
        expect(exerciseElement.exercise).toBeDefined();
        expect(exerciseElement.reps).toEqual(workoutToCreate.elements[1].reps);
        expect(exerciseElement.sets).toEqual(workoutToCreate.elements[1].sets);
        expect(exerciseElement.rest).toEqual(workoutToCreate.elements[1].rest);
        expect(exerciseElement.startWeight_percent).toEqual(
          workoutToCreate.elements[1].startWeight_percent
        );
      } catch (error) {
        console.error('Test failed:', error);
        throw error;
      }
    });
  });
});
