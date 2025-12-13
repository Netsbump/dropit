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
      name: 'Épaulé-Jeté',
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

  // Complexes basés sur les vrais entraînements
  const complexesToCreate = [
    {
      category: 'Arraché',
      exercises: [
        { name: 'Passage', order: 0 },
        { name: 'Chute', order: 1 },
        { name: 'Flexion d\'Arraché', order: 2 }
      ]
    },
    {
      category: 'Arraché',
      exercises: [
        { name: 'Arraché Flexion', order: 0 },
        { name: 'Flexion d\'Arraché', order: 1 }
      ]
    },
    {
      category: 'Épaulé-Jeté',
      exercises: [
        { name: 'Passage Epaulé', order: 0 },
        { name: 'Squat Devant', order: 1 }
      ]
    },
    {
      category: 'Épaulé-Jeté',
      exercises: [
        { name: 'Epaulé Flexion', order: 0 },
        { name: 'Jeté Fente', order: 1 }
      ]
    },
    {
      category: 'Épaulé-Jeté',
      exercises: [
        { name: 'Epaulé Debout', order: 0 },
        { name: 'Squat (drop)', order: 1 },
        { name: 'Epaulé Flexion', order: 2 },
        { name: 'Jeté Fente', order: 3 }
      ]
    },
    {
      category: 'Arraché',
      exercises: [
        { name: 'Tirage Lourd d\'Arraché', order: 0 },
        { name: 'Arraché Flexion', order: 1 }
      ]
    },
    {
      category: 'Épaulé-Jeté',
      exercises: [
        { name: 'Epaulé Flexion', order: 0 },
        { name: 'Squat Nuque', order: 1 },
        { name: 'Jeté Fente', order: 2 }
      ]
    }
  ];

  const complexesCreated: Complex[] = [];
  for (const complexData of complexesToCreate) {
    const complex = new Complex();
    complex.complexCategory = complexCategoriesMap[complexData.category];
    complex.createdBy = null;

    await em.persistAndFlush(complex);

    for (const exerciseData of complexData.exercises) {
      const exerciseComplex = new ExerciseComplex();
      exerciseComplex.complex = complex;
      exerciseComplex.exercise = exercisesMap[exerciseData.name];
      exerciseComplex.order = exerciseData.order;

      await em.persistAndFlush(exerciseComplex);
    }

    console.log('Complex created:', complex);
    complexesCreated.push(complex);
  }

  return complexesCreated;
}
