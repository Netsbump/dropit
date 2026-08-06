import { EntityManager } from '@mikro-orm/core';
import { AthleteEntity as Athlete } from '../modules/database/entities/athlete.entity';
import { PersonalRecord } from '../modules/athletes/domain/personal-record.entity';
import { Exercise } from '../modules/training/domain/exercise.entity';

export async function seedPersonalRecords(em: EntityManager): Promise<void> {
  console.log('Seeding personal records...');

  const athletes = await em.find(Athlete, {}, { limit: 5 });
  const exercises = await em.find(Exercise, {});

  const snatch = exercises.find((e) => e.name === 'Arraché');
  const cleanAndJerk = exercises.find((e) => e.name === 'Épaulé-Jeté');
  const commonExercises = [
    'Squat Nuque',
    'Squat Clavicule',
    'Développé Militaire',
    'Soulevé de Terre',
  ]
    .map((name) => exercises.find((e) => e.name === name))
    .filter(Boolean) as Exercise[];

  const prDistribution = [
    async (athlete: Athlete) => {
      if (snatch && cleanAndJerk) {
        await createPR(em, athlete, snatch, 80);
        await createPR(em, athlete, cleanAndJerk, 100);
        for (const exercise of commonExercises) {
          await createPR(em, athlete, exercise, getRandomWeight(exercise.name));
        }
      }
    },
    async (athlete: Athlete) => {
      if (snatch && cleanAndJerk) {
        await createPR(em, athlete, snatch, 85);
        await createPR(em, athlete, cleanAndJerk, 105);
        for (const exercise of commonExercises) {
          await createPR(em, athlete, exercise, getRandomWeight(exercise.name));
        }
      }
    },
    async (athlete: Athlete) => {
      if (snatch) {
        await createPR(em, athlete, snatch, 75);
      }
    },
    async (athlete: Athlete) => {
      if (cleanAndJerk) {
        await createPR(em, athlete, cleanAndJerk, 95);
      }
    },
    async (athlete: Athlete) => {
      for (const exercise of commonExercises) {
        await createPR(em, athlete, exercise, getRandomWeight(exercise.name));
      }
    },
  ];

  for (let i = 0; i < athletes.length; i++) {
    await prDistribution[i](athletes[i]);
  }

  await em.flush();
  console.log('Personal records ensured');
}

async function createPR(
  em: EntityManager,
  athlete: Athlete,
  exercise: Exercise,
  weight: number
): Promise<void> {
  const existing = await em.findOne(PersonalRecord, { athlete, exercise });
  if (existing) return;

  const pr = new PersonalRecord();
  pr.athlete = athlete;
  pr.exercise = exercise;
  pr.weight = weight;
  pr.date = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000);
  em.persist(pr);
}

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
