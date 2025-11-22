import { EntityManager } from '@mikro-orm/core';
import { Complex } from '../modules/training/domain/complex.entity';
import { Exercise } from '../modules/training/domain/exercise.entity';
import { WorkoutCategory } from '../modules/training/domain/workout-category.entity';
import { WORKOUT_ELEMENT_TYPES } from '../modules/training/domain/workout-element.entity';
import { WorkoutElement } from '../modules/training/domain/workout-element.entity';
import { Workout } from '../modules/training/domain/workout.entity';
import { seedComplexes } from './complex.seeder';

export async function seedWorkouts(em: EntityManager): Promise<void> {

  // Creation of complexes and their categories
  const complexes = await seedComplexes(em);

  // Exercises are already created by seedComplexes
  const exercisesMap: Record<string, Exercise> = {};
  const exercises = await em.find(Exercise, {});
  for (const exercise of exercises) {
    exercisesMap[exercise.name] = exercise;
  }

  // Creation of workout categories
  const workoutCategories = [
    {
      name: 'Saison',
      description: 'Entraînements pendant la saison de compétition',
    },
    {
      name: 'Décharge',
      description: 'Entraînements légers pour la récupération',
    },
    {
      name: 'Fond',
      description: 'Entraînements de préparation physique générale',
    },
  ];

  const workoutCategoriesMap: Record<string, WorkoutCategory> = {};
  for (const workoutCategory of workoutCategories) {
    const categoryToCreate = new WorkoutCategory();
    categoryToCreate.name = workoutCategory.name;
    categoryToCreate.createdBy = null;
    await em.persistAndFlush(categoryToCreate);
    workoutCategoriesMap[workoutCategory.name] = categoryToCreate;
    console.log('Workout category created:', categoryToCreate);
  }

  // Basé sur la séance du Lundi 17 Novembre
  const workout1 = new Workout();
  workout1.description = 'Séance technique avec variations d\'intensité';
  workout1.category = workoutCategoriesMap.Saison;
  workout1.createdBy = null;

  await em.persistAndFlush(workout1);

  // Element 1: Complex Passage + Chute + Flexion d'Arraché @ BAV
  const element1 = new WorkoutElement();
  element1.type = WORKOUT_ELEMENT_TYPES.COMPLEX;
  element1.complex = complexes[0]; // Passage + Chute + Flexion d'Arraché
  element1.order = 0;
  element1.commentary = '@ BAV (Barre à Vide)';
  element1.blocks = [
    {
      order: 1,
      numberOfSets: 2,
      intensity: {
        percentageOfMax: 30,
        referenceExerciseId: exercisesMap.Passage.id,
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap.Passage.id, reps: 2, order: 1 },
        { exerciseId: exercisesMap.Chute.id, reps: 2, order: 2 },
        { exerciseId: exercisesMap['Flexion d\'Arraché'].id, reps: 2, order: 3 }
      ]
    }
  ];
  element1.workout = workout1;
  await em.persistAndFlush(element1);

  // Element 2: Complex Arraché Flexion + Flexion d'Arraché avec progression
  const element2 = new WorkoutElement();
  element2.type = WORKOUT_ELEMENT_TYPES.COMPLEX;
  element2.complex = complexes[1]; // Arraché Flexion + Flexion d'Arraché
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
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 2, order: 1 },
        { exerciseId: exercisesMap['Flexion d\'Arraché'].id, reps: 2, order: 2 }
      ]
    },
    {
      order: 2,
      numberOfSets: 2,
      rest: 90,
      intensity: {
        percentageOfMax: 70,
        referenceExerciseId: exercisesMap['Arraché Flexion'].id,
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 1 },
        { exerciseId: exercisesMap['Flexion d\'Arraché'].id, reps: 1, order: 2 }
      ]
    }
  ];
  element2.workout = workout1;
  await em.persistAndFlush(element2);

  // Element 3: Arraché Flexion simple
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
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 1 }
      ]
    }
  ];
  element3.workout = workout1;
  await em.persistAndFlush(element3);

  // Element 4: Squat Nuque
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
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Squat Nuque'].id, reps: 4, order: 1 }
      ]
    }
  ];
  element4.workout = workout1;
  await em.persistAndFlush(element4);

  console.log('Workout 1 created:', workout1);

  // Workout 2 - Basé sur Mercredi 19 Novembre
  const workout2 = new Workout();
  workout2.description = 'Focus montée en charge progressive';
  workout2.category = workoutCategoriesMap.Saison;
  workout2.createdBy = null;

  await em.persistAndFlush(workout2);

  // Element 1: Epaulé Flexion + Jeté Fente avec 5 blocs de progression
  const workout2Element1 = new WorkoutElement();
  workout2Element1.type = WORKOUT_ELEMENT_TYPES.COMPLEX;
  workout2Element1.complex = complexes[3]; // Epaulé Flexion + Jeté Fente
  workout2Element1.order = 0;
  workout2Element1.blocks = [
    {
      order: 1,
      numberOfSets: 1,
      rest: 180,
      intensity: {
        percentageOfMax: 75,
        referenceExerciseId: exercisesMap['Epaulé Flexion'].id,
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Epaulé Flexion'].id, reps: 1, order: 1 },
        { exerciseId: exercisesMap['Jeté Fente'].id, reps: 1, order: 2 }
      ]
    },
    {
      order: 2,
      numberOfSets: 1,
      rest: 180,
      intensity: {
        percentageOfMax: 80,
        referenceExerciseId: exercisesMap['Epaulé Flexion'].id,
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Epaulé Flexion'].id, reps: 1, order: 1 },
        { exerciseId: exercisesMap['Jeté Fente'].id, reps: 1, order: 2 }
      ]
    },
    {
      order: 3,
      numberOfSets: 1,
      rest: 180,
      intensity: {
        percentageOfMax: 85,
        referenceExerciseId: exercisesMap['Epaulé Flexion'].id,
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Epaulé Flexion'].id, reps: 1, order: 1 },
        { exerciseId: exercisesMap['Jeté Fente'].id, reps: 1, order: 2 }
      ]
    },
    {
      order: 4,
      numberOfSets: 1,
      rest: 180,
      intensity: {
        percentageOfMax: 90,
        referenceExerciseId: exercisesMap['Epaulé Flexion'].id,
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Epaulé Flexion'].id, reps: 1, order: 1 },
        { exerciseId: exercisesMap['Jeté Fente'].id, reps: 1, order: 2 }
      ]
    },
    {
      order: 5,
      numberOfSets: 1,
      rest: 180,
      intensity: {
        percentageOfMax: 93,
        referenceExerciseId: exercisesMap['Epaulé Flexion'].id,
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Epaulé Flexion'].id, reps: 1, order: 1 },
        { exerciseId: exercisesMap['Jeté Fente'].id, reps: 1, order: 2 }
      ]
    }
  ];
  workout2Element1.workout = workout2;
  await em.persistAndFlush(workout2Element1);

  // Element 2: Squat Nuque simple
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
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Squat Nuque'].id, reps: 5, order: 1 }
      ]
    }
  ];
  workout2Element2.workout = workout2;
  await em.persistAndFlush(workout2Element2);

  console.log('Workout 2 created:', workout2);

  // Workout 3 - Simple pour la décharge
  const workout3 = new Workout();
  workout3.description = 'Séance technique avec charges légères';
  workout3.category = workoutCategoriesMap.Décharge;
  workout3.createdBy = null;

  await em.persistAndFlush(workout3);

  // Element 1: Complex Passage Epaulé + Squat Devant
  const workout3Element1 = new WorkoutElement();
  workout3Element1.type = WORKOUT_ELEMENT_TYPES.COMPLEX;
  workout3Element1.complex = complexes[2]; // Passage Epaulé + Squat Devant
  workout3Element1.order = 0;
  workout3Element1.blocks = [
    {
      order: 1,
      numberOfSets: 3,
      rest: 120,
      intensity: {
        percentageOfMax: 50,
        referenceExerciseId: exercisesMap['Passage Epaulé'].id,
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Passage Epaulé'].id, reps: 2, order: 1 },
        { exerciseId: exercisesMap['Squat Devant'].id, reps: 2, order: 2 }
      ]
    }
  ];
  workout3Element1.workout = workout3;
  await em.persistAndFlush(workout3Element1);

  console.log('Workout 3 created:', workout3);

  // Workout 4 - Exemple 2 : Arraché Flexion avec montée progressive
  const workout4 = new Workout();
  workout4.description = 'Montée progressive en intensité - Arraché Flexion';
  workout4.category = workoutCategoriesMap.Saison;
  workout4.createdBy = null;

  await em.persistAndFlush(workout4);

  // Element 1: Arraché Flexion avec montée progressive (78%, 82%, 85%, 90%)
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
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 1 }
      ]
    },
    {
      order: 2,
      numberOfSets: 1,
      rest: 120,
      intensity: {
        percentageOfMax: 82,
        referenceExerciseId: exercisesMap['Arraché Flexion'].id,
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 1 }
      ]
    },
    {
      order: 3,
      numberOfSets: 1,
      rest: 120,
      intensity: {
        percentageOfMax: 85,
        referenceExerciseId: exercisesMap['Arraché Flexion'].id,
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 1 }
      ]
    },
    {
      order: 4,
      numberOfSets: 1,
      rest: 120,
      intensity: {
        percentageOfMax: 90,
        referenceExerciseId: exercisesMap['Arraché Flexion'].id,
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 1 }
      ]
    }
  ];
  workout4Element1.workout = workout4;
  await em.persistAndFlush(workout4Element1);

  console.log('Workout 4 created:', workout4);

  // Workout 5 - Exemple 4 : Tirage Lourd d'Arraché + Arraché Flexion
  const workout5 = new Workout();
  workout5.description = 'Variations de volume - Tirage Lourd d\'Arraché';
  workout5.category = workoutCategoriesMap.Saison;
  workout5.createdBy = null;

  await em.persistAndFlush(workout5);

  // Element 1: Complex Tirage Lourd d'Arraché + Arraché Flexion
  const workout5Element1 = new WorkoutElement();
  workout5Element1.type = WORKOUT_ELEMENT_TYPES.COMPLEX;
  workout5Element1.complex = complexes[5]; // Tirage Lourd d'Arraché + Arraché Flexion
  workout5Element1.order = 0;
  workout5Element1.blocks = [
    {
      order: 1,
      numberOfSets: 4,
      rest: 120,
      intensity: {
        percentageOfMax: 60,
        referenceExerciseId: exercisesMap['Arraché Flexion'].id,
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Tirage Lourd d\'Arraché'].id, reps: 3, order: 1 },
        { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 2 }
      ]
    },
    {
      order: 2,
      numberOfSets: 2,
      rest: 120,
      intensity: {
        percentageOfMax: 70,
        referenceExerciseId: exercisesMap['Arraché Flexion'].id,
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Tirage Lourd d\'Arraché'].id, reps: 2, order: 1 },
        { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 2 }
      ]
    },
    {
      order: 3,
      numberOfSets: 1,
      rest: 120,
      intensity: {
        percentageOfMax: 80,
        referenceExerciseId: exercisesMap['Arraché Flexion'].id,
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Tirage Lourd d\'Arraché'].id, reps: 1, order: 1 },
        { exerciseId: exercisesMap['Arraché Flexion'].id, reps: 1, order: 2 }
      ]
    }
  ];
  workout5Element1.workout = workout5;
  await em.persistAndFlush(workout5Element1);

  console.log('Workout 5 created:', workout5);

  // Workout 6 - Exemple 6 : Complex large avec multiples exercices
  const workout6 = new Workout();
  workout6.description = 'Complex complet Epaulé Debout + Squat (drop) + Epaulé Flexion + Jeté Fente';
  workout6.category = workoutCategoriesMap.Saison;
  workout6.createdBy = null;

  await em.persistAndFlush(workout6);

  // Element 1: Complex Epaulé Debout + Squat (drop) + Epaulé Flexion + Jeté Fente
  const workout6Element1 = new WorkoutElement();
  workout6Element1.type = WORKOUT_ELEMENT_TYPES.COMPLEX;
  workout6Element1.complex = complexes[4]; // Epaulé Debout + Squat (drop) + Epaulé Flexion + Jeté Fente
  workout6Element1.order = 0;
  workout6Element1.blocks = [
    {
      order: 1,
      numberOfSets: 4,
      rest: 240,
      intensity: {
        percentageOfMax: 80,
        referenceExerciseId: exercisesMap['Epaulé Debout'].id,
        type: 'percentage' as const
      },
      exercises: [
        { exerciseId: exercisesMap['Epaulé Debout'].id, reps: 1, order: 1 },
        { exerciseId: exercisesMap['Squat (drop)'].id, reps: 1, order: 2 },
        { exerciseId: exercisesMap['Epaulé Flexion'].id, reps: 1, order: 3 },
        { exerciseId: exercisesMap['Jeté Fente'].id, reps: 1, order: 4 }
      ]
    }
  ];
  workout6Element1.workout = workout6;
  await em.persistAndFlush(workout6Element1);

  console.log('Workout 6 created:', workout6);
  console.log('All workouts seeded successfully!');
}
