import { MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { createTestMikroOrmOptions } from '../config/mikro-orm.config';

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
    await orm.close();
  });

  describe('1. Database Connection', () => {
    it('should be connected to database', async () => {
      expect(orm).toBeDefined();
      expect(orm.em).toBeDefined();
    });
  });

  describe('2. Organization & Users Setup', () => {
    it('should setup organization and users', async () => {
      const { setupOrganization } = await import('./organization.integration.spec');
      await setupOrganization(orm);
    });
  });

  describe('3. Exercise Tests', () => {
    it('should test exercise operations', async () => {
      const { runExerciseTests } = await import('./exercise.integration.spec');
      await runExerciseTests(orm);
    });
  });

  describe('4. Complex Tests', () => {
    it('should test complex operations', async () => {
      const { runComplexTests } = await import('./complex.integration.spec');
      await runComplexTests(orm);
    });
  });

  describe('5. Workout Tests', () => {
    it('should test workout operations', async () => {
      const { runWorkoutTests } = await import('./workout.integration.spec');
      await runWorkoutTests(orm);
    });
  });
}); 