import { CompetitorLevel, SexCategory } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { AthleteEntity as Athlete } from '../modules/database/entities/athlete.entity';
import { CompetitorStatus } from '../modules/athletes/domain/competitor-status.entity';

export async function seedCompetitorStatuses(em: EntityManager): Promise<void> {
  console.log('Seeding competitor statuses...');

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

  const n = Math.min(athletes.length, competitorData.length);
  for (let i = 0; i < n; i++) {
    const existing = await em.findOne(CompetitorStatus, {
      athlete: athletes[i],
    });
    if (existing) continue;

    const status = new CompetitorStatus();
    status.level = competitorData[i].level;
    status.sexCategory = competitorData[i].sexCategory;
    status.weightCategory = competitorData[i].weightCategory;
    status.athlete = athletes[i];
    em.persist(status);
  }

  await em.flush();
  console.log('Competitor statuses ensured');
}
