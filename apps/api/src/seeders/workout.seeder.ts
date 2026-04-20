import { EntityManager } from '@mikro-orm/core';
import { Complex } from '../modules/training/domain/complex.entity';
import { Exercise } from '../modules/training/domain/exercise.entity';
import { WorkoutCategory } from '../modules/training/domain/workout-category.entity';
import { WORKOUT_ELEMENT_TYPES } from '../modules/training/domain/workout-element.entity';
import { WorkoutElement } from '../modules/training/domain/workout-element.entity';
import { Workout } from '../modules/training/domain/workout.entity';
import { seedComplexes } from './complex.seeder';

/** Demo workouts in seed order; category names are resolved against DB (migration). */
const DEMO_WORKOUT_SEEDS = [
  {
    description: 'Séance technique avec variations d\'intensité',
    category: 'Saison',
  },
  {
    description: 'Focus montée en charge progressive',
    category: 'Saison',
  },
  {
    description: 'Séance technique avec charges légères',
    category: 'Décharge',
  },
  {
    description: 'Montée progressive en intensité - Arraché Flexion',
    category: 'Saison',
  },
  {
    description: 'Variations de volume - Tirage Lourd d\'Arraché',
    category: 'Saison',
  },
  {
    description:
      'Complex complet Epaulé Debout + Squat (drop) + Epaulé Flexion + Jeté Fente',
    category: 'Saison',
  },
] as const;

function workoutCategoryNamesFromDemoSeeds(): string[] {
  return [...new Set(DEMO_WORKOUT_SEEDS.map((s) => s.category))];
}

async function requireWorkoutCategories(
  em: EntityManager,
  names: readonly string[],
): Promise<Record<string, WorkoutCategory>> {
  const map: Record<string, WorkoutCategory> = {};
  const missing: string[] = [];
  for (const name of names) {
    const cat = await em.findOne(WorkoutCategory, { name });
    if (!cat) {
      missing.push(name);
    } else {
      map[name] = cat;
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing workout categories: ${missing.join(', ')}. Apply migrations first (e.g. pnpm --filter api db:migration:up), then seed.`,
    );
  }
  return map;
}

async function allDemoWorkoutsPresent(em: EntityManager): Promise<boolean> {
  for (const { description } of DEMO_WORKOUT_SEEDS) {
    const w = await em.findOne(Workout, { description });
    if (!w) return false;
  }
  return true;
}

async function ensureWorkout(
  em: EntityManager,
  description: string,
  category: WorkoutCategory,
): Promise<Workout> {
  let w = await em.findOne(Workout, { description });
  if (w) return w;
  w = new Workout();
  w.description = description;
  w.category = category;
  w.createdBy = null;
  await em.persistAndFlush(w);
  return w;
}

export async function seedWorkouts(em: EntityManager): Promise<void> {
  if (await allDemoWorkoutsPresent(em)) {
    console.log('Demo workouts already present; skipping workout seed chain');
    return;
  }

  const complexes = await seedComplexes(em);

  const exercisesMap: Record<string, Exercise> = {};
  const exercises = await em.find(Exercise, {});
  for (const exercise of exercises) {
    exercisesMap[exercise.name] = exercise;
  }

  const workoutCategoriesMap = await requireWorkoutCategories(
    em,
    workoutCategoryNamesFromDemoSeeds(),
  );

  // Based on the Monday 17 November session
  const workout1 = await ensureWorkout(
    em,
    DEMO_WORKOUT_SEEDS[0].description,
    workoutCategoriesMap[DEMO_WORKOUT_SEEDS[0].category],
  );
  if ((await em.count(WorkoutElement, { workout: workout1 })) === 0) {
    const element1 = new WorkoutElement();
    element1.type = WORKOUT_ELEMENT_TYPES.COMPLEX;
    element1.complex = complexes[0];
    element1.order = 0;
    element1.commentary = '@ BAV (Barre à Vide)';
    element1.blocks = [
      {
        order: 1,
        numberOfSets: 2,
        intensity: {
          percentageOfMax: 30,
          referenceExerciseId: exercisesMap.Passage.id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap.Passage.id, reps: 2, order: 1 },
          { exerciseId: exercisesMap.Chute.id, reps: 2, order: 2 },
          { exerciseId: exercisesMap['Flexion d\'Arraché'].id, reps: 2, order: 3 },
        ],
      },
    ];
    element1.workout = workout1;
    await em.persistAndFlush(element1);

    const element2 = new WorkoutElement();
    element2.type = WORKOUT_ELEMENT_TYPES.COMPLEX;
    element2.complex = complexes[1];
    element2.order = 1;
    element2.commentary = 'Rest 1min30';
    element2.blocks = [
      {
        order: 1,
        numberOfSets: 2,
        rest: 90,
        intensity: {
          percentageOfMax: 60,
          referenceExerciseId: exercisesMap['Arraché Flexion'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 2, order: 1 },
          { exerciseId: exercisesMap['Flexion d\'Arraché'].id, reps: 2, order: 2 },
        ],
      },
      {
        order: 2,
        numberOfSets: 2,
        rest: 90,
        intensity: {
          percentageOfMax: 70,
          referenceExerciseId: exercisesMap['Arraché Flexion'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 1 },
          { exerciseId: exercisesMap['Flexion d\'Arraché'].id, reps: 1, order: 2 },
        ],
      },
    ];
    element2.workout = workout1;
    await em.persistAndFlush(element2);

    const element3 = new WorkoutElement();
    element3.type = WORKOUT_ELEMENT_TYPES.EXERCISE;
    element3.exercise = exercisesMap['Arraché Flexion'];
    element3.order = 2;
    element3.commentary = 'Monté en gamme simple';
    element3.blocks = [
      {
        order: 1,
        numberOfSets: 3,
        rest: 120,
        intensity: {
          percentageOfMax: 85,
          referenceExerciseId: exercisesMap['Arraché Flexion'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 1 },
        ],
      },
    ];
    element3.workout = workout1;
    await em.persistAndFlush(element3);

    const element4 = new WorkoutElement();
    element4.type = WORKOUT_ELEMENT_TYPES.EXERCISE;
    element4.exercise = exercisesMap['Squat Nuque'];
    element4.order = 3;
    element4.blocks = [
      {
        order: 1,
        numberOfSets: 5,
        rest: 180,
        intensity: {
          percentageOfMax: 76,
          referenceExerciseId: exercisesMap['Squat Nuque'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Squat Nuque'].id, reps: 4, order: 1 },
        ],
      },
    ];
    element4.workout = workout1;
    await em.persistAndFlush(element4);
  }

  const workout2 = await ensureWorkout(
    em,
    DEMO_WORKOUT_SEEDS[1].description,
    workoutCategoriesMap[DEMO_WORKOUT_SEEDS[1].category],
  );
  if ((await em.count(WorkoutElement, { workout: workout2 })) === 0) {
    const workout2Element1 = new WorkoutElement();
    workout2Element1.type = WORKOUT_ELEMENT_TYPES.COMPLEX;
    workout2Element1.complex = complexes[3];
    workout2Element1.order = 0;
    workout2Element1.blocks = [
      {
        order: 1,
        numberOfSets: 1,
        rest: 180,
        intensity: {
          percentageOfMax: 75,
          referenceExerciseId: exercisesMap['Epaulé Flexion'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Epaulé Flexion'].id, reps: 1, order: 1 },
          { exerciseId: exercisesMap['Jeté Fente'].id, reps: 1, order: 2 },
        ],
      },
      {
        order: 2,
        numberOfSets: 1,
        rest: 180,
        intensity: {
          percentageOfMax: 80,
          referenceExerciseId: exercisesMap['Epaulé Flexion'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Epaulé Flexion'].id, reps: 1, order: 1 },
          { exerciseId: exercisesMap['Jeté Fente'].id, reps: 1, order: 2 },
        ],
      },
      {
        order: 3,
        numberOfSets: 1,
        rest: 180,
        intensity: {
          percentageOfMax: 85,
          referenceExerciseId: exercisesMap['Epaulé Flexion'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Epaulé Flexion'].id, reps: 1, order: 1 },
          { exerciseId: exercisesMap['Jeté Fente'].id, reps: 1, order: 2 },
        ],
      },
      {
        order: 4,
        numberOfSets: 1,
        rest: 180,
        intensity: {
          percentageOfMax: 90,
          referenceExerciseId: exercisesMap['Epaulé Flexion'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Epaulé Flexion'].id, reps: 1, order: 1 },
          { exerciseId: exercisesMap['Jeté Fente'].id, reps: 1, order: 2 },
        ],
      },
      {
        order: 5,
        numberOfSets: 1,
        rest: 180,
        intensity: {
          percentageOfMax: 93,
          referenceExerciseId: exercisesMap['Epaulé Flexion'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Epaulé Flexion'].id, reps: 1, order: 1 },
          { exerciseId: exercisesMap['Jeté Fente'].id, reps: 1, order: 2 },
        ],
      },
    ];
    workout2Element1.workout = workout2;
    await em.persistAndFlush(workout2Element1);

    const workout2Element2 = new WorkoutElement();
    workout2Element2.type = WORKOUT_ELEMENT_TYPES.EXERCISE;
    workout2Element2.exercise = exercisesMap['Squat Nuque'];
    workout2Element2.order = 1;
    workout2Element2.commentary = 'Recherche de vitesse au redressement';
    workout2Element2.blocks = [
      {
        order: 1,
        numberOfSets: 4,
        rest: 180,
        intensity: {
          percentageOfMax: 73,
          referenceExerciseId: exercisesMap['Squat Nuque'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Squat Nuque'].id, reps: 5, order: 1 },
        ],
      },
    ];
    workout2Element2.workout = workout2;
    await em.persistAndFlush(workout2Element2);
  }

  const workout3 = await ensureWorkout(
    em,
    DEMO_WORKOUT_SEEDS[2].description,
    workoutCategoriesMap[DEMO_WORKOUT_SEEDS[2].category],
  );
  if ((await em.count(WorkoutElement, { workout: workout3 })) === 0) {
    const workout3Element1 = new WorkoutElement();
    workout3Element1.type = WORKOUT_ELEMENT_TYPES.COMPLEX;
    workout3Element1.complex = complexes[2];
    workout3Element1.order = 0;
    workout3Element1.blocks = [
      {
        order: 1,
        numberOfSets: 3,
        rest: 120,
        intensity: {
          percentageOfMax: 50,
          referenceExerciseId: exercisesMap['Passage Epaulé'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Passage Epaulé'].id, reps: 2, order: 1 },
          { exerciseId: exercisesMap['Squat Devant'].id, reps: 2, order: 2 },
        ],
      },
    ];
    workout3Element1.workout = workout3;
    await em.persistAndFlush(workout3Element1);
  }

  const workout4 = await ensureWorkout(
    em,
    DEMO_WORKOUT_SEEDS[3].description,
    workoutCategoriesMap[DEMO_WORKOUT_SEEDS[3].category],
  );
  if ((await em.count(WorkoutElement, { workout: workout4 })) === 0) {
    const workout4Element1 = new WorkoutElement();
    workout4Element1.type = WORKOUT_ELEMENT_TYPES.EXERCISE;
    workout4Element1.exercise = exercisesMap['Arraché Flexion'];
    workout4Element1.order = 0;
    workout4Element1.commentary = 'Doublé Jusqu\'a 75%';
    workout4Element1.blocks = [
      {
        order: 1,
        numberOfSets: 1,
        rest: 120,
        intensity: {
          percentageOfMax: 78,
          referenceExerciseId: exercisesMap['Arraché Flexion'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 1 },
        ],
      },
      {
        order: 2,
        numberOfSets: 1,
        rest: 120,
        intensity: {
          percentageOfMax: 82,
          referenceExerciseId: exercisesMap['Arraché Flexion'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 1 },
        ],
      },
      {
        order: 3,
        numberOfSets: 1,
        rest: 120,
        intensity: {
          percentageOfMax: 85,
          referenceExerciseId: exercisesMap['Arraché Flexion'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 1 },
        ],
      },
      {
        order: 4,
        numberOfSets: 1,
        rest: 120,
        intensity: {
          percentageOfMax: 90,
          referenceExerciseId: exercisesMap['Arraché Flexion'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 1 },
        ],
      },
    ];
    workout4Element1.workout = workout4;
    await em.persistAndFlush(workout4Element1);
  }

  const workout5 = await ensureWorkout(
    em,
    DEMO_WORKOUT_SEEDS[4].description,
    workoutCategoriesMap[DEMO_WORKOUT_SEEDS[4].category],
  );
  if ((await em.count(WorkoutElement, { workout: workout5 })) === 0) {
    const workout5Element1 = new WorkoutElement();
    workout5Element1.type = WORKOUT_ELEMENT_TYPES.COMPLEX;
    workout5Element1.complex = complexes[5];
    workout5Element1.order = 0;
    workout5Element1.blocks = [
      {
        order: 1,
        numberOfSets: 4,
        rest: 120,
        intensity: {
          percentageOfMax: 60,
          referenceExerciseId: exercisesMap['Arraché Flexion'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Tirage Lourd d\'Arraché'].id, reps: 3, order: 1 },
          { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 2 },
        ],
      },
      {
        order: 2,
        numberOfSets: 2,
        rest: 120,
        intensity: {
          percentageOfMax: 70,
          referenceExerciseId: exercisesMap['Arraché Flexion'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Tirage Lourd d\'Arraché'].id, reps: 2, order: 1 },
          { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 2 },
        ],
      },
      {
        order: 3,
        numberOfSets: 1,
        rest: 120,
        intensity: {
          percentageOfMax: 80,
          referenceExerciseId: exercisesMap['Arraché Flexion'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Tirage Lourd d\'Arraché'].id, reps: 1, order: 1 },
          { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 2 },
        ],
      },
    ];
    workout5Element1.workout = workout5;
    await em.persistAndFlush(workout5Element1);
  }

  const workout6 = await ensureWorkout(
    em,
    DEMO_WORKOUT_SEEDS[5].description,
    workoutCategoriesMap[DEMO_WORKOUT_SEEDS[5].category],
  );
  if ((await em.count(WorkoutElement, { workout: workout6 })) === 0) {
    const workout6Element1 = new WorkoutElement();
    workout6Element1.type = WORKOUT_ELEMENT_TYPES.COMPLEX;
    workout6Element1.complex = complexes[4];
    workout6Element1.order = 0;
    workout6Element1.blocks = [
      {
        order: 1,
        numberOfSets: 4,
        rest: 240,
        intensity: {
          percentageOfMax: 80,
          referenceExerciseId: exercisesMap['Epaulé Debout'].id,
          type: 'percentage' as const,
        },
        exercises: [
          { exerciseId: exercisesMap['Epaulé Debout'].id, reps: 1, order: 1 },
          { exerciseId: exercisesMap['Squat (drop)'].id, reps: 1, order: 2 },
          { exerciseId: exercisesMap['Epaulé Flexion'].id, reps: 1, order: 3 },
          { exerciseId: exercisesMap['Jeté Fente'].id, reps: 1, order: 4 },
        ],
      },
    ];
    workout6Element1.workout = workout6;
    await em.persistAndFlush(workout6Element1);
  }

  console.log('All workouts seeded successfully!');
}
