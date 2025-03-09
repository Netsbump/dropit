import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { seedAthletes } from './athlete.seeder';
import { seedClubNames } from './club-name.seeder';
import { seedClubs } from './club.seeder';
import { seedCoachAthleteRelationships } from './coach-athlete.seeder';
import { seedWorkouts } from './workout.seeder';

export class MainSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('Running all seeders...');

    // 1. Seed des entités de base (exercices, complexes, workouts)
    // Les exercices et complexes sont gérés par seedWorkouts
    await seedWorkouts(em);

    // 2. Seed des entités utilisateur (clubs, athlètes, relations)
    await seedClubNames(em);
    await seedClubs(em);
    await seedAthletes(em);
    await seedCoachAthleteRelationships(em);

    console.log('All seeds completed successfully');
  }
}
