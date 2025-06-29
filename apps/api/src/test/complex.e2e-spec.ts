import {
  ComplexCategoryDto,
  ComplexDto,
  CreateComplex,
  CreateExercise,
  ExerciseCategoryDto,
  ExerciseDto,
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

describe('ComplexController (e2e)', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let complexCategory: ComplexCategoryDto;
  let exerciseCategory: ExerciseCategoryDto;

  // Déclaration des fonctions utilitaires
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
    const exerciseCategoryService = moduleFixture.get<ExerciseCategoryService>(
      ExerciseCategoryService
    );
    const exerciseService = moduleFixture.get<ExerciseService>(ExerciseService);
    const complexCategoryService = moduleFixture.get<ComplexCategoryService>(
      ComplexCategoryService
    );
    const complexService = moduleFixture.get<ComplexService>(ComplexService);

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
      const exerciseCreated = await exerciseService.createExercise(exercise);

      return {
        id: exerciseCreated.id,
        name: exerciseCreated.name,
        exerciseCategory: exerciseCreated.exerciseCategory,
        video: exerciseCreated.video,
        description: exerciseCreated.description,
        englishName: exerciseCreated.englishName,
        shortName: exerciseCreated.shortName,
      };
    };

    createComplex = async (complex: CreateComplex): Promise<ComplexDto> => {
      const complexCreated = await complexService.createComplex(complex);

      return {
        id: complexCreated.id,
        name: complexCreated.name,
        complexCategory: complexCreated.complexCategory,
        exercises: complexCreated.exercises,
        description: complexCreated.description,
      };
    };

    // Seed de la base de données avec au moins un type d'exercice
    exerciseCategory = await createExerciseCategory('Haltérophilie');

    // Seed de la base de données avec au moins un type de complexe
    complexCategory = await createComplexCategory('Complex Arraché');

    await app.init();
  });

  afterAll(async () => {
    // Fermer la connexion à la base de données
    await orm.close();
    // Fermer l'application NestJS
    await app.close();
  });

  describe('/complex', () => {
    it('POST - should create a complex', async () => {
      try {
        const exercise1 = await createExercise({
          name: 'Squat',
          description: 'Basic squat exercise',
          exerciseCategory: exerciseCategory.id,
        });

        const exercise2 = await createExercise({
          name: 'Deadlift',
          description: 'Basic deadlift exercise',
          exerciseCategory: exerciseCategory.id,
        });

        const exercise3 = await createExercise({
          name: 'Bench Press',
          description: 'Basic bench press exercise',
          exerciseCategory: exerciseCategory.id,
        });

        // Créer l'objet à envoyer à l'API
        const complexToCreate = {
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
        };

        const response = await request(app.getHttpServer())
          .post('/complex')
          .send(complexToCreate)
          .expect(201);
      } catch (error) {
        console.error('Test failed:', error);
        throw error;
      }
    });
  });
});
