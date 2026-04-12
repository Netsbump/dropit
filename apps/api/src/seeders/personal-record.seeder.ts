import { EntityManager } from '@mikro-orm/core';
import { Athlete } from '../modules/athletes/domain/athlete.entity';
import { PersonalRecord } from '../modules/athletes/domain/personal-record.entity';
import { Exercise } from '../modules/training/domain/exercise.entity';

export async function seedPersonalRecords(em: EntityManager): Promise<void> {
  console.log('Seeding personal records...');

  // Get the 5 athletes
  const athletes = await em.find(Athlete, {}, { limit: 5 });

  // Get all exercises
  const exercises = await em.find(Exercise, {});

  // Find the specific exercises
  const snatch = exercises.find((e) => e.name === 'Arraché');
  const cleanAndJerk = exercises.find((e) => e.name === 'Épaulé-Jeté');
  const commonExercises = [
    'Squat Nuque',
    'Squat Clavicule',
    'Développé Militaire',
    'Soulevé de Terre',
  ]
    .map((name) => exercises.find((e) => e.name === name))
    .filter(Boolean);

  // PR distribution per athlete
  const prDistribution = [
    // Athlete 1: Snatch, C&J and others
    async (athlete: Athlete) => {
      if (snatch && cleanAndJerk) {
        await createPR(em, athlete, snatch, 80);
        await createPR(em, athlete, cleanAndJerk, 100);
        for (const exercise of commonExercises) {
          if (exercise) {
            await createPR(
              em,
              athlete,
              exercise,
              getRandomWeight(exercise.name)
            );
          }
        }
      }
    },
    // Athlete 2: Snatch, C&J and others
    async (athlete: Athlete) => {
      if (snatch && cleanAndJerk) {
        await createPR(em, athlete, snatch, 85);
        await createPR(em, athlete, cleanAndJerk, 105);
        for (const exercise of commonExercises) {
          if (exercise) {
            await createPR(
              em,
              athlete,
              exercise,
              getRandomWeight(exercise.name)
            );
          }
        }
      }
    },
    // Athlete 3: Snatch only
    async (athlete: Athlete) => {
      if (snatch) {
        await createPR(em, athlete, snatch, 75);
      }
    },
    // Athlete 4: C&J only
    async (athlete: Athlete) => {
      if (cleanAndJerk) {
        await createPR(em, athlete, cleanAndJerk, 95);
      }
    },
    // Athlete 5: Other exercises only
    async (athlete: Athlete) => {
      for (const exercise of commonExercises) {
        if (exercise) {
          await createPR(em, athlete, exercise, getRandomWeight(exercise.name));
        }
      }
    },
  ];

  // Create PRs for each athlete according to their distribution
  for (let i = 0; i < athletes.length; i++) {
    await prDistribution[i](athletes[i]);
  }

  await em.flush();
  console.log('Personal records seeded successfully');
}

// Helper to create a PR
async function createPR(
  em: EntityManager,
  athlete: Athlete,
  exercise: Exercise,
  weight: number
): Promise<void> {
  const pr = new PersonalRecord();
  pr.athlete = athlete;
  pr.exercise = exercise;
  pr.weight = weight;
  // Random date within the last 6 months
  pr.date = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000);
  em.persist(pr);
}

// Helper to generate realistic weights per exercise
function getRandomWeight(exerciseName: string): number {
  const weightRanges: Record<string, [number, number]> = {
    'Squat Nuque': [100, 180],
    'Squat Clavicule': [80, 150],
    'Développé Militaire': [50, 90],
    'Soulevé de Terre': [120, 200],
    default: [40, 100],
  };

  const [min, max] = weightRanges[exerciseName] || weightRanges.default;
  return Math.floor(Math.random() * (max - min) + min);
}
