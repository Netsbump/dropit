//import { faker } from '@faker-js/faker';
import { EntityManager } from '@mikro-orm/core';
import { Factory, Seeder } from '@mikro-orm/seeder';
import { ExerciseCategory } from '../entities/exerciseCategory.entity';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const types = ['Haltérophilie', 'Endurance', 'Cardio', 'Musculation'];

    for (const exerciseCategory of types) {
      const exerciseCategoryToCreate = new ExerciseCategory();
      exerciseCategoryToCreate.name = exerciseCategory;
      await em.persistAndFlush(exerciseCategoryToCreate);

      console.log('Exercise type created:', exerciseCategoryToCreate);
    }
  }
}
