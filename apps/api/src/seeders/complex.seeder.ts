import { EntityManager } from '@mikro-orm/core';
import { ComplexCategory } from '../modules/training/domain/complex-category.entity';
import { Complex } from '../modules/training/domain/complex.entity';
import { ExerciseComplex } from '../modules/training/domain/exercise-complex.entity';
import { seedExercises } from './exercise.seeder';

export async function seedComplexes(
  em: EntityManager
): Promise<Complex[]> {

  const exercisesMap = await seedExercises(em);

  const complexCategories = [
    {
      name: 'Arraché',
      description: "Exercices focalisés sur la technique de l'arraché",
    },
    {
      name: 'Épaulé',
      description: "Exercices focalisés sur la technique de l'épaulé-jeté",
    },
    {
      name: 'Renforcement',
      description: 'Exercices de musculation spécifiques',
    },
  ];

  const complexCategoriesMap: Record<string, ComplexCategory> = {};
  for (const complexCategory of complexCategories) {
    const categoryToCreate = new ComplexCategory();
    categoryToCreate.name = complexCategory.name;
    categoryToCreate.createdBy = null;
    await em.persistAndFlush(categoryToCreate);
    complexCategoriesMap[complexCategory.name] = categoryToCreate;
    console.log('Complex category created:', categoryToCreate);
  }

  const ARRACHE_CATEGORY_INDEX = 0;
  const EPAULE_CATEGORY_INDEX = 1;
  const RENFORCEMENT_CATEGORY_INDEX = 2;

  const complexesToCreate = [
    {
      category: complexCategories[ARRACHE_CATEGORY_INDEX].name,
      description: "Focus sur la technique de l'arraché",
      exercises: [
        {
          name: 'Arraché Debout',
          reps: 3,
        },
        {
          name: 'Tirage Nuque',
          reps: 5,
        },
        {
          name: 'Squat Clavicule',
          reps: 2,
        },
      ],
    },
    {
      category: complexCategories[EPAULE_CATEGORY_INDEX].name,
      description: "EMOM",
      exercises: [
        {
          name: 'Épaulé Debout',
          reps: 3,
        },
        {
          name: 'Jeté Fente',
          reps: 2,
        },
        {
          name: 'Squat Clavicule',
          reps: 3,
        },
        {
          name: 'Développé Militaire',
          reps: 8,
        },
      ],
    },
    {
      category: complexCategories[RENFORCEMENT_CATEGORY_INDEX].name,
      description: 'On le fait en TABATA',
      exercises: [
        {
          name: 'Squat Nuque',
          reps: 6,
        },
        {
          name: 'Développé Militaire',
          reps: 8,
        },
        {
          name: 'Soulevé de Terre',
          reps: 4,
        },
      ],
    },
    {
      category: complexCategories[ARRACHE_CATEGORY_INDEX].name,
      description: "Focus sur la technique de l'arraché, EMOM",
      exercises: [
        {
          name: 'Arraché Debout',
          reps: 2,
        },
        {
          name: 'Tirage Nuque',
          reps: 4,
        },
        {
          name: 'Squat Nuque',
          reps: 5,
        },
      ],
    },
    {
      category: complexCategories[EPAULE_CATEGORY_INDEX].name,
      description: "On se concentre sur la technique",
      exercises: [
        {
          name: 'Épaulé Debout',
          reps: 2,
        },
        {
          name: 'Squat Clavicule',
          reps: 3,
        },
        {
          name: 'Développé Militaire',
          reps: 5,
        },
      ],
    },
  ];

  const complexesCreated: Complex[] = [];
  for (const complexData of complexesToCreate) {
    const complex = new Complex();
    complex.description = complexData.description;
    complex.complexCategory = complexCategoriesMap[complexData.category];
    complex.createdBy = null;

    await em.persistAndFlush(complex);

    for (let i = 0; i < complexData.exercises.length; i++) {
      const exerciseData = complexData.exercises[i];

      const exerciseComplex = new ExerciseComplex();
      exerciseComplex.complex = complex;
      exerciseComplex.exercise = exercisesMap[exerciseData.name];
      exerciseComplex.order = i;
      exerciseComplex.reps = exerciseData.reps;

      await em.persistAndFlush(exerciseComplex);
    }

    console.log('Complex created:', complex);
    complexesCreated.push(complex);
  }

  return complexesCreated;
}
