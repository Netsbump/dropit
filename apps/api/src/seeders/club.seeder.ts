import { EntityManager } from '@mikro-orm/core';
import { Club } from '../modules/members/club/club.entity';

export async function seedClubs(em: EntityManager): Promise<Club[]> {
  console.log('Seeding clubs...');

  const clubNamesData = [
    { name: 'CrossFit Paris' },
    { name: 'Weightlifting Club Lyon' },
    { name: 'Strength Academy Marseille' },
  ];

  const createdClubs: Club[] = [];

  for (const clubNameData of clubNamesData) {
    // Vérifier si un club existe déjà avec ce nom
    const existingClub = await em.findOne(Club, { name: clubNameData.name });

    if (!existingClub) {
      const club = new Club();
      club.name = clubNameData.name;

      em.persist(club);
      createdClubs.push(club);
    } else {
      createdClubs.push(existingClub);
    }
  }

  await em.flush();
  console.log(`${createdClubs.length} clubs seeded`);

  return createdClubs;
}
