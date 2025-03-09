import { EntityManager } from '@mikro-orm/core';
import { ClubName } from '../entities/club-name.entity';

export async function seedClubNames(em: EntityManager): Promise<ClubName[]> {
  console.log('Seeding club names...');

  const clubNamesData = [
    { name: 'CrossFit Paris' },
    { name: 'Weightlifting Club Lyon' },
    { name: 'Strength Academy Marseille' },
  ];

  const createdClubNames: ClubName[] = [];

  for (const clubNameData of clubNamesData) {
    // Vérifier si le nom de club existe déjà
    const existingClubName = await em.findOne(ClubName, {
      name: clubNameData.name,
    });

    if (!existingClubName) {
      const clubName = new ClubName();
      clubName.name = clubNameData.name;

      em.persist(clubName);
      createdClubNames.push(clubName);
    } else {
      createdClubNames.push(existingClubName);
    }
  }

  await em.flush();
  console.log(`${createdClubNames.length} club names seeded`);

  return createdClubNames;
}
