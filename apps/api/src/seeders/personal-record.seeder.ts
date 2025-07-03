import { EntityManager } from '@mikro-orm/core';
import { Athlete } from '../modules/members/athlete/domain/athlete.entity';
import { PersonalRecord } from '../modules/performance/personal-record/personal-record.entity';
import { Exercise } from '../modules/training/exercise/exercise.entity';

export async function seedPersonalRecords(em: EntityManager): Promise<void> {
  console.log('Seeding personal records...');

  // Récupérer les 5 athlètes
  const athletes = await em.find(Athlete, {}, { limit: 5 });

  // Récupérer tous les exercices
  const exercises = await em.find(Exercise, {});

  // Trouver les exercices spécifiques
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

  // Distribution des PR pour chaque athlète
  const prDistribution = [
    // Athlète 1: Snatch, C&J et autres
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
    // Athlète 2: Snatch, C&J et autres
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
    // Athlète 3: Snatch uniquement
    async (athlete: Athlete) => {
      if (snatch) {
        await createPR(em, athlete, snatch, 75);
      }
    },
    // Athlète 4: C&J uniquement
    async (athlete: Athlete) => {
      if (cleanAndJerk) {
        await createPR(em, athlete, cleanAndJerk, 95);
      }
    },
    // Athlète 5: Autres exercices uniquement
    async (athlete: Athlete) => {
      for (const exercise of commonExercises) {
        if (exercise) {
          await createPR(em, athlete, exercise, getRandomWeight(exercise.name));
        }
      }
    },
  ];

  // Créer les PR pour chaque athlète selon leur distribution
  for (let i = 0; i < athletes.length; i++) {
    await prDistribution[i](athletes[i]);
  }

  await em.flush();
  console.log('Personal records seeded successfully');
}

// Fonction utilitaire pour créer un PR
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
  // Date aléatoire dans les 6 derniers mois
  pr.date = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000);
  em.persist(pr);
}

// Fonction utilitaire pour générer des poids réalistes selon l'exercice
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
