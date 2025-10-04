import { MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { createTestMikroOrmOptions } from '../config/mikro-orm.config';
import { setupOrganization } from './organization.integration';
import { runExerciseTests } from './exercise.integration';
import { runComplexTests } from './complex.integration';
import { runWorkoutTests } from './workout.integration';

describe('Integration Tests Suite', () => {
  let orm: MikroORM;

  beforeAll(async () => {
    // Suppress console logs during integration tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MikroORM)
      .useFactory({
        factory: () => MikroORM.init(createTestMikroOrmOptions()),
      })
      .compile();

    orm = moduleFixture.get<MikroORM>(MikroORM);
  });

  afterAll(async () => {
    if (orm) {
      await orm.close();
    }
  });

  describe('1. Database Connection', () => {
    it('should be connected to database', async () => {
      expect(orm).toBeDefined();
      expect(orm.em).toBeDefined();
    });
  });

  describe('2. Organization & Users Setup', () => {
    it('should setup organization and users', async () => {
      await setupOrganization(orm);
    });
  });

  describe('3. Exercise Tests', () => {
    it('should test exercise operations', async () => {
      await runExerciseTests(orm);
    });
  });

  describe('4. Complex Tests', () => {
    it('should test complex operations', async () => {
      await runComplexTests(orm);
    });
  });

  describe('5. Workout Tests', () => {
    it('should test workout operations', async () => {
      await runWorkoutTests(orm);
    });
  });
}); 