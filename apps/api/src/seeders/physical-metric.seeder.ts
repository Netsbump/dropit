import { EntityManager } from '@mikro-orm/core';
import { AthleteEntity as Athlete } from '../modules/database/entities/athlete.entity';
import { PhysicalMetric } from '../modules/athletes/domain/physical-metric.entity';

const METRICS_PER_ATHLETE = 3;

export async function seedPhysicalMetrics(em: EntityManager): Promise<void> {
  console.log('Seeding physical metrics...');

  const athletes = await em.find(Athlete, {}, { limit: 5 });

  for (const athlete of athletes) {
    const existingCount = await em.count(PhysicalMetric, { athlete });
    const toAdd = Math.max(0, METRICS_PER_ATHLETE - existingCount);
    for (let i = 0; i < toAdd; i++) {
      const metric = new PhysicalMetric();
      metric.athlete = athlete;
      metric.weight = Math.floor(Math.random() * (100 - 50) + 50);
      metric.height = Number((Math.random() * (1.9 - 1.6) + 1.6).toFixed(2));
      metric.date = new Date();
      em.persist(metric);
    }
  }

  await em.flush();
  console.log(`Physical metrics ensured for up to ${athletes.length} athletes`);
}
