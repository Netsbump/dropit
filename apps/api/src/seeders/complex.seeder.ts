import { EntityManager } from '@mikro-orm/core';
import { ComplexCategory } from '../modules/training/complex-category/complex-category.entity';
import { Complex } from '../modules/training/complex/complex.entity';
import { ExerciseComplex } from '../modules/training/exercise-complex/exercise-complex.entity';
import { seedExercises } from './exercise.seeder';

export async function seedComplexes(
  em: EntityManager
): Promise<Record<string, Complex>> {
  // Récupérer les exercices
  const exercisesMap = await seedExercises(em);

  const complexCategories = [
    {
      name: 'EMOM',
      description: 'Exercices à exécuter toutes les minutes',
    },
    {
      name: 'Technique Arraché',
      description: "Exercices focalisés sur la technique de l'arraché",
    },
    {
      name: 'Technique Épaulé-Jeté',
      description: "Exercices focalisés sur la technique de l'épaulé-jeté",
    },
    {
      name: 'TABATA',
      description: 'Exercices en intervalles courts (20s effort / 10s repos)',
    },
  ];

  const complexCategoriesMap: Record<string, ComplexCategory> = {};
  for (const complexCategory of complexCategories) {
    const categoryToCreate = new ComplexCategory();
    categoryToCreate.name = complexCategory.name;
    await em.persistAndFlush(categoryToCreate);
    complexCategoriesMap[complexCategory.name] = categoryToCreate;
    console.log('Complex category created:', categoryToCreate);
  }

  const complexesToCreate = [
    {
      name: 'EMOM Technique Arraché',
      category: 'EMOM',
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
      name: 'Complex Épaulé-Jeté',
      category: 'Technique Épaulé-Jeté',
      description: "Focus sur la technique de l'épaulé-jeté",
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
      name: 'TABATA Force',
      category: 'TABATA',
      description: 'Focus sur la force',
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
      name: 'Technique Arraché Complet',
      category: 'Technique Arraché',
      description: "Focus sur la technique de l'arraché",
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
      name: 'EMOM Épaulé',
      category: 'EMOM',
      description: "Focus sur l'épaulé",
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

  const complexesMap: Record<string, Complex> = {};
  for (const complexData of complexesToCreate) {
    const complex = new Complex();
    complex.name = complexData.name;
    complex.description = complexData.description;
    complex.complexCategory = complexCategoriesMap[complexData.category];

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

    console.log('Complex created:', complex.name);
    complexesMap[complex.name] = complex;
  }

  return complexesMap;
}
