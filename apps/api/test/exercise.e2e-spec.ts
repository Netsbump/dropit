import { CreateExercise, ExerciseResponse } from '@dropit/schemas';
import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ExerciseType } from '../src/entities/exerciseType.entity';
import { ExerciseService } from '../src/modules/exercise/exercise.service';
import { ExerciseTypeService } from '../src/modules/exerciseType/exerciseType.service';

describe('ExerciseController (e2e)', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let exerciseType: ExerciseType;

  // Déclaration des fonctions utilitaires
  let createExerciseType: (name: string) => Promise<ExerciseType>;
  let createExercise: (exercise: CreateExercise) => Promise<ExerciseResponse>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    orm = moduleFixture.get<MikroORM>(MikroORM);

    // Nettoyer la base de données avant les tests
    const generator = orm.getSchemaGenerator();
    await generator.refreshDatabase();

    // Initialisation des fonctions utilitaires
    const exerciseTypeService =
      moduleFixture.get<ExerciseTypeService>(ExerciseTypeService);
    const exerciseService = moduleFixture.get<ExerciseService>(ExerciseService);

    createExerciseType = async (name: string): Promise<ExerciseType> => {
      return await exerciseTypeService.createExerciseType({ name });
    };

    createExercise = async (
      exercise: CreateExercise
    ): Promise<ExerciseResponse> => {
      const exerciseCreated = await exerciseService.createExercise(exercise);

      return {
        id: exerciseCreated.id,
        name: exerciseCreated.name,
        exerciseType: exerciseCreated.exerciseType,
        video: exerciseCreated.video,
        description: exerciseCreated.description,
        englishName: exerciseCreated.englishName,
        shortName: exerciseCreated.shortName,
      };
    };

    // Seed de la base de données avec au moinsun type d'exercice
    exerciseType = await createExerciseType('Haltérophilie');

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
        exerciseType: exerciseType.id,
      };

      console.log('Sending exercise:', exercise); // Debug

      const response = await request(app.getHttpServer())
        .post('/exercise')
        .send(exercise)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe(exercise.name);
      expect(response.body.exerciseType.name).toBe(exerciseType.name);
      expect(response.body.exerciseType.id).toBe(exerciseType.id);
    });

    it('GET - should return all exercises', async () => {
      // D'abord créer quelques exercices
      await createExercise({
        name: 'Push-up',
        description: 'Basic push-up',
        exerciseType: exerciseType.id,
      });

      await createExercise({
        name: 'Pull-up',
        description: 'Basic pull-up',
        exerciseType: exerciseType.id,
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
        exerciseType: exerciseType.id,
      });

      const response = await request(app.getHttpServer())
        .get(`/exercise/${newExercise.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe('Deadlift');
      expect(response.body.exerciseType.id).toBe(exerciseType.id);
    });

    it('PATCH :id - should update an exercise', async () => {
      const newExercise = await createExercise({
        name: 'Old name',
        description: 'Old description',
        exerciseType: exerciseType.id,
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
        exerciseType: exerciseType.id,
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
        await request(app.getHttpServer()).get('/exercise/99999').expect(404);
      });

      it('PATCH :id - should return 404 for non-existent exercise', async () => {
        const updateData = {
          name: 'New name',
          description: 'New description',
        };

        await request(app.getHttpServer())
          .patch('/exercise/99999')
          .send(updateData)
          .expect(404);
      });

      it('DELETE :id - should return 404 for non-existent exercise', async () => {
        await request(app.getHttpServer())
          .delete('/exercise/99999')
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
