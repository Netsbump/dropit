import { EntityManager } from '@mikro-orm/core';
import { TrainingSession } from '../modules/training/domain/training-session.entity';
import { AthleteTrainingSession } from '../modules/training/domain/athlete-training-session.entity';
import { Workout } from '../modules/training/domain/workout.entity';
import { Organization } from '../modules/auth/domain/organization/organization.entity';
import { Athlete } from '../modules/athletes/domain/athlete.entity';

export async function seedTrainingSessions(em: EntityManager): Promise<void> {
  console.log('Seeding training sessions...');

  const workouts = await em.find(
    Workout,
    {},
    {
      orderBy: { createdAt: 'ASC' },
      limit: 1,
    }
  );

  if (workouts.length === 0) {
    console.warn('No workouts found, skipping training session seeding');
    return;
  }

  const firstWorkout = workouts[0];

  const organizations = await em.find(Organization, {}, { limit: 1 });
  if (organizations.length === 0) {
    console.warn('No organization found, skipping training session seeding');
    return;
  }

  const organization = organizations[0];

  const athletes = await em.find(Athlete, {});
  if (athletes.length === 0) {
    console.warn('No athletes found, skipping training session seeding');
    return;
  }

  let trainingSession = await em.findOne(TrainingSession, {
    workout: firstWorkout,
    organization,
  });

  if (!trainingSession) {
    trainingSession = new TrainingSession();
    trainingSession.workout = firstWorkout;
    trainingSession.organization = organization;
    trainingSession.scheduledDate = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000
    );
    await em.persistAndFlush(trainingSession);
    console.log('Training session created for:', trainingSession.scheduledDate);
  } else {
    console.log('Training session already exists for demo workout/org');
  }

  for (const athlete of athletes) {
    const link = await em.findOne(AthleteTrainingSession, {
      athlete,
      trainingSession,
    });
    if (link) continue;

    const athleteTrainingSession = new AthleteTrainingSession();
    athleteTrainingSession.athlete = athlete;
    athleteTrainingSession.trainingSession = trainingSession;
    await em.persistAndFlush(athleteTrainingSession);
  }

  console.log('Training session seeding completed');
}
