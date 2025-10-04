import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { seedAthletes } from './athlete.seeder';
import { seedCompetitorStatuses } from './competitor-status.seeder';
import { seedOrganizations } from './organization.seeder';
import { seedPersonalRecords } from './personal-record.seeder';
import { seedPhysicalMetrics } from './physical-metric.seeder';
import { seedWorkouts } from './workout.seeder';
import { seedTrainingSessions } from './training-session.seeder';
import { User } from '../modules/identity/domain/auth/user.entity';

export class MainSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('Running all seeders...');

    // Vérifier si la base est déjà peuplée
    const userCount = await em.count(User);
    if (userCount > 0) {
      console.log('Database already contains users, skipping all seeding');
      return;
    }

    // 1. Seed des entités de base (exercices, complexes, workouts)
    await seedWorkouts(em);

    // 2. Seed des entités utilisateur (organisations, athlètes)
    await seedAthletes(em);
    await seedOrganizations(em);

    //3. Seed des données des athlètes supplémentaires
    await seedCompetitorStatuses(em);
    await seedPersonalRecords(em);
    await seedPhysicalMetrics(em);

    //4. Seed des training sessions
    await seedTrainingSessions(em);

    console.log('All seeds completed successfully');
  }
}
