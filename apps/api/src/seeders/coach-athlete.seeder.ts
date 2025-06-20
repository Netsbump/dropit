import { EntityManager } from '@mikro-orm/core';
import { Athlete } from '../modules/members/athlete/athlete.entity';
import { CoachAthlete } from '../modules/members/coach-athlete/coach-athlete.entity';
import { User } from '../modules/members/auth/auth.entity';
import { UserRole } from '../modules/members/auth/auth.entity';

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

  // Trouver le coach en vérifiant le rôle dans la table user
  const coachUser = await em.getConnection().execute(
    'SELECT id FROM "user" WHERE role = ? LIMIT 1',
    [UserRole.COACH]
  );

  if (!coachUser || coachUser.length === 0) {
    console.log('No coach found. Please run seedAthletes first.');
    return;
  }

  const coachUserId = coachUser[0].id;
  const coach = athletes.find(athlete => athlete.user?.id === coachUserId);

  if (!coach) {
    console.log('Coach athlete not found. Please run seedAthletes first.');
    return;
  }

  console.log(`Found coach: ${coach.firstName} ${coach.lastName}`);

  // Les autres athlètes seront rattachés à ce coach
  const athletesToLink = athletes.filter(athlete => athlete.id !== coach.id);

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
