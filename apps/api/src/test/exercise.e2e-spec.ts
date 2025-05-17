import {
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
import { ExerciseService } from '../modules/exercise/exercise.service';
import { ExerciseCategoryService } from '../modules/exerciseCategory/exerciseCategory.service';

describe('ExerciseController (e2e)', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let exerciseCategory: ExerciseCategoryDto;

  // Déclaration des fonctions utilitaires
  let createExerciseCategory: (name: string) => Promise<ExerciseCategoryDto>;
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

    createExerciseCategory = async (
      name: string
    ): Promise<ExerciseCategoryDto> => {
      return await exerciseCategoryService.createExerciseCategory({ name });
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

    // Seed de la base de données avec au moinsun type d'exercice
    exerciseCategory = await createExerciseCategory('Haltérophilie');

    await app.init();
  });

  afterAll(async () => {
    // Fermer la connexion à la base de données
    await orm.close();
    // Fermer l'application NestJS
    await app.close();
  });

  describe('/exercise', () => {
    it('POST - should create an exercise', async () => {
      const exercise: CreateExercise = {
        name: 'Squat',
        description: 'Basic squat exercise',
        exerciseCategory: exerciseCategory.id,
      };

      const response = await request(app.getHttpServer())
        .post('/exercise')
        .send(exercise)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe(exercise.name);
      expect(response.body.exerciseCategory.name).toBe(exerciseCategory.name);
      expect(response.body.exerciseCategory.id).toBe(exerciseCategory.id);
    });

    it('GET - should return all exercises', async () => {
      // D'abord créer quelques exercices
      await createExercise({
        name: 'Push-up',
        description: 'Basic push-up',
        exerciseCategory: exerciseCategory.id,
      });

      await createExercise({
        name: 'Pull-up',
        description: 'Basic pull-up',
        exerciseCategory: exerciseCategory.id,
      });

      const response = await request(app.getHttpServer())
        .get('/exercise')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('GET :id - should return a specific exercise', async () => {
      const newExercise = await createExercise({
        name: 'Deadlift',
        description: 'Basic deadlift',
        exerciseCategory: exerciseCategory.id,
      });

      const response = await request(app.getHttpServer())
        .get(`/exercise/${newExercise.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe('Deadlift');
      expect(response.body.exerciseCategory.id).toBe(exerciseCategory.id);
    });

    it('PATCH :id - should update an exercise', async () => {
      const newExercise = await createExercise({
        name: 'Old name',
        description: 'Old description',
        exerciseCategory: exerciseCategory.id,
      });

      const updateData = {
        name: 'New name',
        description: 'New description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/exercise/${newExercise.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
    });

    it('DELETE :id - should delete an exercise', async () => {
      const newExercise = await createExercise({
        name: 'Burpees',
        description: 'Will be deleted',
        exerciseCategory: exerciseCategory.id,
      });

      await request(app.getHttpServer())
        .delete(`/exercise/${newExercise.id}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/exercise/${newExercise.id}`)
        .expect(404);

      expect(response.body.message).toBe(
        `Exercise with ID ${newExercise.id} not found`
      );
    });

    describe('Error cases', () => {
      it('GET :id - should return 404 for non-existent exercise', async () => {
        await request(app.getHttpServer())
          .get('/exercise/123e4567-e89b-12d3-a456-426614174000')
          .expect(404);
      });

      it('PATCH :id - should return 404 for non-existent exercise', async () => {
        const updateData = {
          name: 'New name',
          description: 'New description',
        };

        await request(app.getHttpServer())
          .patch('/exercise/123e4567-e89b-12d3-a456-426614174000')
          .send(updateData)
          .expect(404);
      });

      it('DELETE :id - should return 404 for non-existent exercise', async () => {
        await request(app.getHttpServer())
          .delete('/exercise/123e4567-e89b-12d3-a456-426614174000')
          .expect(404);
      });

      it('POST - should return 400 for invalid exercise data', async () => {
        const invalidExercise = {
          // Manque le champ 'name' qui est obligatoire
          description: 'Invalid exercise',
        };

        await request(app.getHttpServer())
          .post('/exercise')
          .send(invalidExercise)
          .expect(400);
      });
    });
  });
});
