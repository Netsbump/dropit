import { EntityManager } from '@mikro-orm/core';
import { ExerciseCategory } from '../modules/training/domain/exercise-category.entity';
import { Exercise } from '../modules/training/domain/exercise.entity';

export async function seedExerciseCategories(
  em: EntityManager
): Promise<Record<string, ExerciseCategory>> {
  console.log('Seeding exercise categories...');

  const types = ['Haltérophilie', 'Endurance', 'Cardio', 'Musculation'];
  const categories: Record<string, ExerciseCategory> = {};

  for (const exerciseCategory of types) {
    // Vérifier si la catégorie existe déjà
    const existingCategory = await em.findOne(ExerciseCategory, {
      name: exerciseCategory,
    });

    if (!existingCategory) {
      const exerciseCategoryToCreate = new ExerciseCategory();
      exerciseCategoryToCreate.name = exerciseCategory;
      exerciseCategoryToCreate.createdBy = null;
      em.persist(exerciseCategoryToCreate);
      categories[exerciseCategory] = exerciseCategoryToCreate;
    } else {
      categories[exerciseCategory] = existingCategory;
    }
  }

  await em.flush();
  console.log(`${Object.keys(categories).length} exercise categories seeded`);

  return categories;
}

export async function seedExercises(
  em: EntityManager
): Promise<Record<string, Exercise>> {
  const types = ['Technique', 'Endurance', 'Cardio', 'Renforcement'];
  const categories: Record<string, ExerciseCategory> = {};

  for (const exerciseCategory of types) {
    const exerciseCategoryToCreate = new ExerciseCategory();
    exerciseCategoryToCreate.name = exerciseCategory;
    exerciseCategoryToCreate.createdBy = null;
    await em.persistAndFlush(exerciseCategoryToCreate);
    categories[exerciseCategory] = exerciseCategoryToCreate;
    console.log('Exercise category created:', exerciseCategoryToCreate);
  }

  const exercisesMap: Record<string, Exercise> = {};
  const exercises = [
    {
      name: 'Squat Clavicule',
      category: 'Technique',
      englishName: 'Front Squat',
      shortName: 'Squat Clav',
    },
    {
      name: 'Épaulé Debout',
      category: 'Technique',
      englishName: 'Power Clean',
      shortName: 'PC',
    },
    {
      name: 'Arraché Debout',
      category: 'Technique',
      englishName: 'Power Snatch',
      shortName: 'PS',
    },
    {
      name: 'Jeté Fente',
      category: 'Technique',
      englishName: 'Split Jerk',
      shortName: 'SJ',
    },
    {
      name: 'Arraché',
      category: 'Technique',
      englishName: 'snatch',
      shortName: 'SN',
    },
    {
      name: 'Squat Nuque',
      category: 'Technique',
      englishName: 'Back Squat',
      shortName: 'BS',
    },
    {
      name: 'Tirage Nuque',
      category: 'Technique',
      englishName: 'Snatch Pull',
      shortName: 'SP',
    },
    {
      name: 'Développé Militaire',
      category: 'Renforcement',
      englishName: 'Military Press',
      shortName: 'MP',
    },
    {
      name: 'Soulevé de Terre',
      category: 'Renforcement',
      englishName: 'Deadlift',
      shortName: 'DL',
    },
    {
      name: 'Tirage Menton',
      category: 'Renforcement',
      englishName: 'Upright Row',
      shortName: 'UR',
    },
    {
      name: 'Développé Couché',
      category: 'Renforcement',
      englishName: 'Bench Press',
      shortName: 'BP',
    },
    {
      name: 'Épaulé-Jeté',
      category: 'Technique',
      englishName: 'cleanAndJerk',
      shortName: 'C&J',
    },
    {
      name: 'Tirage Planche',
      category: 'Renforcement',
      englishName: 'Bent Over Row',
      shortName: 'BOR',
    },
  ];

  for (const exercise of exercises) {
    const exerciseToCreate = new Exercise();
    exerciseToCreate.name = exercise.name;
    exerciseToCreate.exerciseCategory = categories[exercise.category];
    exerciseToCreate.englishName = exercise.englishName;
    exerciseToCreate.shortName = exercise.shortName;
    exerciseToCreate.createdBy = null;
    await em.persistAndFlush(exerciseToCreate);
    exercisesMap[exercise.name] = exerciseToCreate;
    console.log('Exercise created:', exerciseToCreate);
  }

  return exercisesMap;
}
