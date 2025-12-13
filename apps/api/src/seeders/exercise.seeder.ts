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
    // Arraché (Snatch) family
    { name: 'Arraché Flexion', category: 'Technique', englishName: 'Snatch Pull', shortName: 'Arr Flex' },
    { name: 'Flexion d\'Arraché', category: 'Technique', englishName: 'Snatch Pull Hang', shortName: 'Flex Arr' },
    { name: 'Arraché', category: 'Technique', englishName: 'Snatch', shortName: 'Arr' },
    { name: 'Passage', category: 'Technique', englishName: 'Muscle Snatch', shortName: 'Pass' },
    { name: 'Chute', category: 'Technique', englishName: 'Drop Snatch', shortName: 'Chute' },
    { name: 'Arraché Debout', category: 'Technique', englishName: 'Power Snatch', shortName: 'Arr Deb' },

    // Epaulé (Clean) family
    { name: 'Epaulé Flexion', category: 'Technique', englishName: 'Clean Pull', shortName: 'Ep Flex' },
    { name: 'Epaulé Debout', category: 'Technique', englishName: 'Power Clean', shortName: 'Ep Deb' },
    { name: 'Epaulé', category: 'Technique', englishName: 'Clean', shortName: 'Ep' },
    { name: 'Passage Epaulé', category: 'Technique', englishName: 'Muscle Clean', shortName: 'Pass Ep' },
    { name: 'Épaulé-Jeté', category: 'Technique', englishName: 'Clean & Jerk', shortName: 'Ep-Jeté' },

    // Jeté (Jerk) family
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

    // Développés et renforcement
    { name: 'Développé Militaire', category: 'Renforcement', englishName: 'Military Press', shortName: 'Dév Mil' },
    { name: 'Développé Couché', category: 'Renforcement', englishName: 'Bench Press', shortName: 'Dév Cou' },
    { name: 'Soulevé de Terre', category: 'Renforcement', englishName: 'Deadlift', shortName: 'SDT' },
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
