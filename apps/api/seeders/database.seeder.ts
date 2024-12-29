//import { faker } from '@faker-js/faker';
import { EntityManager } from '@mikro-orm/core';
import { Factory, Seeder } from '@mikro-orm/seeder';
import { ExerciseType } from '../src/entities/exerciseType.entity';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const types = ['Haltérophilie', 'Endurance', 'Cardio', 'Musculation'];

    for (const exerciseType of types) {
      const exerciseTypeToCreate = new ExerciseType();
      exerciseTypeToCreate.name = exerciseType;
      await em.persistAndFlush(exerciseTypeToCreate);

      console.log('Exercise type created:', exerciseTypeToCreate);
    }
  }
}
