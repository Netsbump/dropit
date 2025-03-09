import { EntityManager } from '@mikro-orm/core';
import { ClubName } from '../entities/club-name.entity';
import { Club } from '../entities/club.entity';

export async function seedClubs(em: EntityManager): Promise<Club[]> {
  console.log('Seeding clubs...');

  // Récupérer les noms de clubs existants
  const clubNames = await em.find(ClubName, {});

  if (clubNames.length === 0) {
    console.log('No club names found. Please run seedClubNames first.');
    return [];
  }

  const createdClubs: Club[] = [];

  // Créer un club pour chaque nom de club
  for (const clubName of clubNames) {
    // Vérifier si un club existe déjà avec ce nom
    const existingClub = await em.findOne(Club, { clubName });

    if (!existingClub) {
      const club = new Club();
      club.clubName = clubName;

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
