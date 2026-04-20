import { EntityManager } from '@mikro-orm/core';
import { ExerciseCategory } from '../modules/training/domain/exercise-category.entity';
import { Exercise } from '../modules/training/domain/exercise.entity';

/** Single source for demo exercises; category names are resolved against DB (migration). */
const EXERCISE_SEED_DEFINITIONS = [
  // Snatch family
  { name: 'Arraché Flexion', category: 'Technique', englishName: 'Snatch Pull', shortName: 'Arr Flex' },
  { name: 'Flexion d\'Arraché', category: 'Technique', englishName: 'Snatch Pull Hang', shortName: 'Flex Arr' },
  { name: 'Arraché', category: 'Technique', englishName: 'Snatch', shortName: 'Arr' },
  { name: 'Passage', category: 'Technique', englishName: 'Muscle Snatch', shortName: 'Pass' },
  { name: 'Chute', category: 'Technique', englishName: 'Drop Snatch', shortName: 'Chute' },
  { name: 'Arraché Debout', category: 'Technique', englishName: 'Power Snatch', shortName: 'Arr Deb' },

  // Clean family
  { name: 'Epaulé Flexion', category: 'Technique', englishName: 'Clean Pull', shortName: 'Ep Flex' },
  { name: 'Epaulé Debout', category: 'Technique', englishName: 'Power Clean', shortName: 'Ep Deb' },
  { name: 'Epaulé', category: 'Technique', englishName: 'Clean', shortName: 'Ep' },
  { name: 'Passage Epaulé', category: 'Technique', englishName: 'Muscle Clean', shortName: 'Pass Ep' },
  { name: 'Épaulé-Jeté', category: 'Technique', englishName: 'Clean & Jerk', shortName: 'Ep-Jeté' },

  // Jerk family
  { name: 'Jeté Fente', category: 'Technique', englishName: 'Split Jerk', shortName: 'Jeté Fente' },
  { name: 'Jeté Nuque', category: 'Technique', englishName: 'Jerk Behind Neck', shortName: 'Jeté Nuque' },

  // Squat family
  { name: 'Squat Nuque', category: 'Technique', englishName: 'Back Squat', shortName: 'Sq Nuque' },
  { name: 'Squat Devant', category: 'Technique', englishName: 'Front Squat', shortName: 'Sq Devant' },
  { name: 'Squat (drop)', category: 'Technique', englishName: 'Drop Squat', shortName: 'Sq drop' },
  { name: 'Squat Clavicule', category: 'Technique', englishName: 'Front Squat', shortName: 'Sq Clav' },

  // Tirages
  { name: 'Tirage Lourd d\'Arraché', category: 'Technique', englishName: 'Snatch High Pull', shortName: 'TLA' },
  { name: 'Tirage Lourd d\'Epaulé', category: 'Technique', englishName: 'Clean High Pull', shortName: 'TLE' },
  { name: 'Tirage Nuque', category: 'Technique', englishName: 'Snatch Pull', shortName: 'Tir Nuque' },
  { name: 'Tirage Planche', category: 'Renforcement', englishName: 'Bent Over Row', shortName: 'Tir Plan' },
  { name: 'Tirage Menton', category: 'Renforcement', englishName: 'Upright Row', shortName: 'Tir Ment' },

  // Presses and strengthening
  { name: 'Développé Militaire', category: 'Renforcement', englishName: 'Military Press', shortName: 'Dév Mil' },
  { name: 'Développé Couché', category: 'Renforcement', englishName: 'Bench Press', shortName: 'Dév Cou' },
  { name: 'Soulevé de Terre', category: 'Renforcement', englishName: 'Deadlift', shortName: 'SDT' },
] as const;

function exerciseCategoryNamesFromDefinitions(): string[] {
  return [...new Set(EXERCISE_SEED_DEFINITIONS.map((row) => row.category))];
}

function missingCategoriesMessage(kind: string, names: string[]): string {
  return `Missing ${kind} categories: ${names.join(', ')}. Apply migrations first (e.g. pnpm --filter api db:migration:up), then seed.`;
}

async function requireExerciseCategories(
  em: EntityManager,
  names: readonly string[],
): Promise<Record<string, ExerciseCategory>> {
  const map: Record<string, ExerciseCategory> = {};
  const missing: string[] = [];
  for (const name of names) {
    const cat = await em.findOne(ExerciseCategory, { name });
    if (!cat) {
      missing.push(name);
    } else {
      map[name] = cat;
    }
  }
  if (missing.length > 0) {
    throw new Error(missingCategoriesMessage('exercise', missing));
  }
  return map;
}

export async function seedExercises(
  em: EntityManager,
): Promise<Record<string, Exercise>> {
  const categories = await requireExerciseCategories(
    em,
    exerciseCategoryNamesFromDefinitions(),
  );

  const exercisesMap: Record<string, Exercise> = {};
  for (const exercise of EXERCISE_SEED_DEFINITIONS) {
    let row = await em.findOne(Exercise, { name: exercise.name });
    if (!row) {
      row = new Exercise();
      row.name = exercise.name;
      row.createdBy = null;
    }
    row.exerciseCategory = categories[exercise.category];
    row.englishName = exercise.englishName;
    row.shortName = exercise.shortName;
    em.persist(row);
    exercisesMap[exercise.name] = row;
  }

  await em.flush();
  return exercisesMap;
}
