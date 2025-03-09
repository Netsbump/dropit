import { EntityManager } from '@mikro-orm/core';
import { Athlete } from '../entities/athlete.entity';
import { CoachAthlete } from '../entities/coach-athlete.entity';

export async function seedCoachAthleteRelationships(
  em: EntityManager
): Promise<void> {
  console.log('Seeding coach-athlete relationships...');

  // Récupérer tous les athlètes
  const athletes = await em.find(Athlete, {});

  if (athletes.length < 2) {
    console.log('Not enough athletes found. Please run seedAthletes first.');
    return;
  }

  // Trouver un coach (le premier athlète créé dans notre seed)
  const coach = athletes[0];

  // Les autres athlètes seront rattachés à ce coach
  const athletesToLink = athletes.slice(1);

  let relationshipsCreated = 0;

  for (const athlete of athletesToLink) {
    // Vérifier si la relation existe déjà
    const existingRelationship = await em.findOne(CoachAthlete, {
      coach,
      athlete,
    });

    if (!existingRelationship) {
      const relationship = new CoachAthlete();
      relationship.coach = coach;
      relationship.athlete = athlete;
      relationship.startDate = new Date();

      em.persist(relationship);
      relationshipsCreated++;
    }
  }

  await em.flush();
  console.log(`${relationshipsCreated} coach-athlete relationships seeded`);
}
