import { EntityManager } from '@mikro-orm/core';
import { ComplexCategory } from '../modules/training/domain/complex-category.entity';
import { Complex } from '../modules/training/domain/complex.entity';
import { ExerciseComplex } from '../modules/training/domain/exercise-complex.entity';
import { seedExercises } from './exercise.seeder';

const COMPLEX_SEED_DEFINITIONS = [
  {
    category: 'Arraché',
    exercises: [
      { name: 'Passage', order: 0 },
      { name: 'Chute', order: 1 },
      { name: 'Flexion d\'Arraché', order: 2 },
    ],
  },
  {
    category: 'Arraché',
    exercises: [
      { name: 'Arraché Flexion', order: 0 },
      { name: 'Flexion d\'Arraché', order: 1 },
    ],
  },
  {
    category: 'Épaulé-Jeté',
    exercises: [
      { name: 'Passage Epaulé', order: 0 },
      { name: 'Squat Devant', order: 1 },
    ],
  },
  {
    category: 'Épaulé-Jeté',
    exercises: [
      { name: 'Epaulé Flexion', order: 0 },
      { name: 'Jeté Fente', order: 1 },
    ],
  },
  {
    category: 'Épaulé-Jeté',
    exercises: [
      { name: 'Epaulé Debout', order: 0 },
      { name: 'Squat (drop)', order: 1 },
      { name: 'Epaulé Flexion', order: 2 },
      { name: 'Jeté Fente', order: 3 },
    ],
  },
  {
    category: 'Arraché',
    exercises: [
      { name: 'Tirage Lourd d\'Arraché', order: 0 },
      { name: 'Arraché Flexion', order: 1 },
    ],
  },
  {
    category: 'Épaulé-Jeté',
    exercises: [
      { name: 'Epaulé Flexion', order: 0 },
      { name: 'Squat Nuque', order: 1 },
      { name: 'Jeté Fente', order: 2 },
    ],
  },
] as const;

function complexCategoryNamesFromDefinitions(): string[] {
  return [...new Set(COMPLEX_SEED_DEFINITIONS.map((row) => row.category))];
}

async function findComplexByExerciseSequence(
  em: EntityManager,
  category: ComplexCategory,
  exerciseNamesInOrder: string[],
): Promise<Complex | null> {
  const complexes = await em.find(Complex, { complexCategory: category });
  for (const c of complexes) {
    const links = await em.find(ExerciseComplex, { complex: c }, {
      orderBy: { order: 'ASC' },
      populate: ['exercise'],
    });
    if (links.length !== exerciseNamesInOrder.length) continue;
    let match = true;
    for (let i = 0; i < links.length; i++) {
      if (links[i].exercise.name !== exerciseNamesInOrder[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      return c;
    }
  }
  return null;
}

async function requireComplexCategories(
  em: EntityManager,
  names: readonly string[],
): Promise<Record<string, ComplexCategory>> {
  const map: Record<string, ComplexCategory> = {};
  const missing: string[] = [];
  for (const name of names) {
    const cat = await em.findOne(ComplexCategory, { name });
    if (!cat) {
      missing.push(name);
    } else {
      map[name] = cat;
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing complex categories: ${missing.join(', ')}. Apply migrations first (e.g. pnpm --filter api db:migration:up), then seed.`,
    );
  }
  return map;
}

export async function seedComplexes(
  em: EntityManager,
): Promise<Complex[]> {
  const exercisesMap = await seedExercises(em);
  const complexCategoriesMap = await requireComplexCategories(
    em,
    complexCategoryNamesFromDefinitions(),
  );

  const complexesCreated: Complex[] = [];
  for (const complexData of COMPLEX_SEED_DEFINITIONS) {
    const category = complexCategoriesMap[complexData.category];
    const exerciseNames = complexData.exercises.map((e) => e.name);
    let complex = await findComplexByExerciseSequence(em, category, exerciseNames);
    if (!complex) {
      complex = new Complex();
      complex.complexCategory = category;
      complex.createdBy = null;
      await em.persistAndFlush(complex);
      for (const exerciseData of complexData.exercises) {
        const exerciseComplex = new ExerciseComplex();
        exerciseComplex.complex = complex;
        exerciseComplex.exercise = exercisesMap[exerciseData.name];
        exerciseComplex.order = exerciseData.order;
        await em.persistAndFlush(exerciseComplex);
      }
    }
    complexesCreated.push(complex);
  }

  return complexesCreated;
}
