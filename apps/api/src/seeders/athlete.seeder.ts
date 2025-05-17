import { UserRole } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Athlete } from '../modules/members/athlete/athlete.entity';
import { User } from '../modules/members/auth/auth.entity';
import { Club } from '../modules/members/club/club.entity';

// Noms et prénoms pour la génération d'athlètes
const femaleFirstNames = [
  'Sophie',
  'Emma',
  'Léa',
  'Chloé',
  'Manon',
  'Camille',
  'Sarah',
  'Océane',
  'Julie',
  'Lucie',
];

const maleFirstNames = [
  'Lucas',
  'Hugo',
  'Thomas',
  'Théo',
  'Noah',
  'Antoine',
  'Louis',
  'Maxime',
  'Alexandre',
  'Paul',
];

const lastNames = [
  'Martin',
  'Bernard',
  'Dubois',
  'Thomas',
  'Robert',
  'Richard',
  'Petit',
  'Durand',
  'Leroy',
  'Moreau',
  'Simon',
  'Laurent',
  'Lefebvre',
  'Michel',
  'Garcia',
  'David',
  'Bertrand',
  'Roux',
  'Vincent',
  'Fournier',
];

export async function seedAthletes(
  em: EntityManager
): Promise<{ athletes: Athlete[]; coach: Athlete }> {
  console.log('Seeding athletes and coach...');

  // Récupérer le premier club existant
  const clubs = await em.find(Club, {}, { limit: 1 });

  if (clubs.length === 0) {
    throw new Error('No club found. Please run seedClubs first.');
  }

  const club = clubs[0]; // Utiliser le premier club trouvé
  console.log(`Using club: ${club.name} for all athletes`);

  const athletes: Athlete[] = [];
  let coach: Athlete | null = null;

  // Créer un coach
  const coachUser = new User();
  coachUser.email = 'coach@example.com';
  coachUser.password = 'password123'; // Dans un environnement réel, utilisez un hash
  coachUser.role = UserRole.COACH;
  coachUser.isActive = true;
  coachUser.isSuperAdmin = false;

  em.persist(coachUser);

  coach = new Athlete();
  coach.firstName = 'Jean';
  coach.lastName = 'Dupont';
  coach.birthday = new Date('1985-05-15');
  coach.country = 'France';
  coach.club = club;
  coach.user = coachUser;

  em.persist(coach);

  // Créer 10 athlètes femmes
  for (let i = 0; i < 10; i++) {
    const firstName = femaleFirstNames[i];
    const lastName = lastNames[i];

    const user = new User();
    user.email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    user.password = 'password123'; // Dans un environnement réel, utilisez un hash
    user.role = UserRole.ATHLETE;
    user.isActive = true;
    user.isSuperAdmin = false;

    em.persist(user);

    const athlete = new Athlete();
    athlete.firstName = firstName;
    athlete.lastName = lastName;
    athlete.birthday = new Date(
      1990 + i,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    );
    athlete.country = 'France';
    athlete.club = club;
    athlete.user = user;

    em.persist(athlete);
    athletes.push(athlete);
  }

  // Créer 10 athlètes hommes
  for (let i = 0; i < 10; i++) {
    const firstName = maleFirstNames[i];
    const lastName = lastNames[i + 10];

    const user = new User();
    user.email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    user.password = 'password123'; // Dans un environnement réel, utilisez un hash
    user.role = UserRole.ATHLETE;
    user.isActive = true;
    user.isSuperAdmin = false;

    em.persist(user);

    const athlete = new Athlete();
    athlete.firstName = firstName;
    athlete.lastName = lastName;
    athlete.birthday = new Date(
      1990 + i,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    );
    athlete.country = 'France';
    athlete.club = club;
    athlete.user = user;

    em.persist(athlete);
    athletes.push(athlete);
  }

  await em.flush();
  console.log(`1 coach and ${athletes.length} athletes seeded`);

  return { athletes, coach };
}
