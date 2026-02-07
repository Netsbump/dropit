import { EntityManager } from '@mikro-orm/core';
import { Athlete } from '../modules/athletes/domain/athlete.entity';
import { PhysicalMetric } from '../modules/athletes/domain/physical-metric.entity';

export async function seedPhysicalMetrics(em: EntityManager): Promise<void> {
  console.log('Seeding physical metrics...');

  // Get the same 5 athletes
  const athletes = await em.find(Athlete, {}, { limit: 5 });

  for (const athlete of athletes) {
    // Create 3 physical metrics per athlete over the last 6 months
    for (let i = 0; i < 3; i++) {
      const metric = new PhysicalMetric();
      metric.athlete = athlete;

      // Weight between 50 and 100kg
      metric.weight = Math.floor(Math.random() * (100 - 50) + 50);
      // Height between 1.60m and 1.90m
      metric.height = Number((Math.random() * (1.9 - 1.6) + 1.6).toFixed(2));
      // Date at time of recording
      metric.date = new Date();

      em.persist(metric);
    }
  }

  await em.flush();
  console.log(`Physical metrics seeded for ${athletes.length} athletes`);
}
