import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { seedAthletes } from './athlete.seeder';
import { seedCompetitorStatuses } from './competitor-status.seeder';
import { seedOrganizations } from './organization.seeder';
import { seedPersonalRecords } from './personal-record.seeder';
import { seedPhysicalMetrics } from './physical-metric.seeder';
import { seedWorkouts } from './workout.seeder';
import { seedTrainingSessions } from './training-session.seeder';

export class MainSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('Running idempotent demo seeders (MainSeeder)...');

    await seedWorkouts(em);
    await seedAthletes(em);
    await seedOrganizations(em);
    await seedCompetitorStatuses(em);
    await seedPersonalRecords(em);
    await seedPhysicalMetrics(em);
    await seedTrainingSessions(em);

    console.log('All seeds completed successfully');
  }
}
