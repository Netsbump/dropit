import { EntityManager } from '@mikro-orm/core';
import { TrainingSession } from '../modules/training/domain/training-session.entity';
import { AthleteTrainingSession } from '../modules/training/domain/athlete-training-session.entity';
import { Workout } from '../modules/training/domain/workout.entity';
import { Organization } from '../modules/identity/domain/organization/organization.entity';
import { Athlete } from '../modules/athletes/domain/athlete.entity';

export async function seedTrainingSessions(em: EntityManager): Promise<void> {
  console.log('Seeding training sessions...');

  // 1. Récupérer le premier workout créé
  const workouts = await em.find(Workout, {}, { orderBy: { createdAt: 'ASC' }, limit: 1 });

  if (workouts.length === 0) {
    console.warn('No workouts found, skipping training session seeding');
    return;
  }

  const firstWorkout = workouts[0];
  console.log('Using workout:', firstWorkout.title);

  // 2. Récupérer l'organisation
  const organizations = await em.find(Organization, {}, { limit: 1 });

  if (organizations.length === 0) {
    console.warn('No organization found, skipping training session seeding');
    return;
  }

  const organization = organizations[0];

  console.log('Using organization:', organization.name);

  // 3. Récupérer tous les athlètes
  const athletes = await em.find(Athlete, {});

  if (athletes.length === 0) {
    console.warn('No athletes found, skipping training session seeding');
    return;
  }

  console.log(`Found ${athletes.length} athletes`);

  // 4. Créer une TrainingSession planifiée pour dans 3 jours
  const trainingSession = new TrainingSession();
  trainingSession.workout = firstWorkout;
  trainingSession.organization = organization;
  trainingSession.scheduledDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // Dans 3 jours

  await em.persistAndFlush(trainingSession);
  console.log('Training session created for:', trainingSession.scheduledDate);

  // 5. Créer des AthleteTrainingSession pour chaque athlète
  for (const athlete of athletes) {
    const athleteTrainingSession = new AthleteTrainingSession();
    athleteTrainingSession.athlete = athlete;
    athleteTrainingSession.trainingSession = trainingSession;
    await em.persistAndFlush(athleteTrainingSession);
  }

  console.log(`Training session assigned to ${athletes.length} athletes`);
  console.log('Training session seeding completed');
}
