import { EntityManager } from '@mikro-orm/core';
import { ExerciseCategory } from '../entities/exercise-category.entity';
import { Exercise } from '../entities/exercise.entity';

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
  const types = ['Haltérophilie', 'Endurance', 'Cardio', 'Musculation'];
  const categories: Record<string, ExerciseCategory> = {};

  for (const exerciseCategory of types) {
    const exerciseCategoryToCreate = new ExerciseCategory();
    exerciseCategoryToCreate.name = exerciseCategory;
    await em.persistAndFlush(exerciseCategoryToCreate);
    categories[exerciseCategory] = exerciseCategoryToCreate;
    console.log('Exercise category created:', exerciseCategoryToCreate);
  }

  const exercisesMap: Record<string, Exercise> = {};
  const exercises = [
    {
      name: 'Squat Clavicule',
      category: 'Haltérophilie',
      englishName: 'Front Squat',
      shortName: 'Squat Clav',
    },
    {
      name: 'Épaulé Debout',
      category: 'Haltérophilie',
      englishName: 'Power Clean',
      shortName: 'PC',
    },
    {
      name: 'Arraché Debout',
      category: 'Haltérophilie',
      englishName: 'Power Snatch',
      shortName: 'PS',
    },
    {
      name: 'Jeté Fente',
      category: 'Haltérophilie',
      englishName: 'Split Jerk',
      shortName: 'SJ',
    },
    {
      name: 'Arraché',
      category: 'Haltérophilie',
      englishName: 'snatch',
      shortName: 'SN',
    },
    {
      name: 'Squat Nuque',
      category: 'Haltérophilie',
      englishName: 'Back Squat',
      shortName: 'BS',
    },
    {
      name: 'Tirage Nuque',
      category: 'Haltérophilie',
      englishName: 'Snatch Pull',
      shortName: 'SP',
    },
    {
      name: 'Développé Militaire',
      category: 'Musculation',
      englishName: 'Military Press',
      shortName: 'MP',
    },
    {
      name: 'Soulevé de Terre',
      category: 'Musculation',
      englishName: 'Deadlift',
      shortName: 'DL',
    },
    {
      name: 'Tirage Menton',
      category: 'Musculation',
      englishName: 'Upright Row',
      shortName: 'UR',
    },
    {
      name: 'Développé Couché',
      category: 'Musculation',
      englishName: 'Bench Press',
      shortName: 'BP',
    },
    {
      name: 'Épaulé-Jeté',
      category: 'Haltérophilie',
      englishName: 'cleanAndJerk',
      shortName: 'C&J',
    },
    {
      name: 'Tirage Planche',
      category: 'Musculation',
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
    await em.persistAndFlush(exerciseToCreate);
    exercisesMap[exercise.name] = exerciseToCreate;
    console.log('Exercise created:', exerciseToCreate);
  }

  return exercisesMap;
}
