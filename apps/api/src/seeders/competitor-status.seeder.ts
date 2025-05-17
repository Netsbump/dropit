import { CompetitorLevel, SexCategory } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Athlete } from '../modules/members/athlete/athlete.entity';
import { CompetitorStatus } from '../modules/performance/competitor-status/competitor-status.entity';

export async function seedCompetitorStatuses(em: EntityManager): Promise<void> {
  console.log('Seeding competitor statuses...');

  // Récupérer 5 athlètes aléatoires
  const athletes = await em.find(Athlete, {}, { limit: 5 });

  const competitorData = [
    {
      level: CompetitorLevel.NATIONAL,
      sexCategory: SexCategory.WOMEN,
      weightCategory: 59,
    },
    {
      level: CompetitorLevel.INTERNATIONAL,
      sexCategory: SexCategory.MEN,
      weightCategory: 81,
    },
    {
      level: CompetitorLevel.REGIONAL,
      sexCategory: SexCategory.WOMEN,
      weightCategory: 64,
    },
    {
      level: CompetitorLevel.ELITE,
      sexCategory: SexCategory.MEN,
      weightCategory: 89,
    },
    {
      level: CompetitorLevel.ROOKIE,
      sexCategory: SexCategory.WOMEN,
      weightCategory: 71,
    },
  ];

  for (let i = 0; i < athletes.length; i++) {
    const status = new CompetitorStatus();
    status.level = competitorData[i].level;
    status.sexCategory = competitorData[i].sexCategory;
    status.weightCategory = competitorData[i].weightCategory;
    status.athlete = athletes[i];

    em.persist(status);
  }

  await em.flush();
  console.log(`${athletes.length} competitor statuses seeded`);
}
