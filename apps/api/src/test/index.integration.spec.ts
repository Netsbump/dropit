import { MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { AppModule } from '../app.module';
import { createTestMikroOrmOptions } from '../modules/database/mikro-orm.config';
import { BrevoAdapter } from '../modules/notification/infrastructure/channels/email/brevo.adapter';
import { runComplexTests } from './complex.integration';
import { runExerciseTests } from './exercise.integration';
import { setupOrganization } from './organization.integration';
import { runWorkoutTests } from './workout.integration';

describe('Integration Tests Suite', () => {
  let orm: MikroORM;

  beforeAll(async () => {
    try {
      // Suppress console logs during integration tests
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(MikroORM)
        .useFactory({
          factory: () => MikroORM.init(createTestMikroOrmOptions()),
        })
        .overrideProvider(BrevoAdapter)
        .useValue({ send: vi.fn() })
        .compile();

      orm = moduleFixture.get<MikroORM>(MikroORM);
    } catch (error) {
      process.stderr.write(
        `${
          error instanceof Error ? error.stack ?? error.message : String(error)
        }\n`
      );
      throw error;
    }
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
