import { EntityManager } from '@mikro-orm/core';
import { Complex } from '../modules/training/domain/complex.entity';
import { Exercise } from '../modules/training/domain/exercise.entity';
import { WorkoutCategory } from '../modules/training/domain/workout-category.entity';
import { WORKOUT_ELEMENT_TYPES } from '../modules/training/domain/workout-element.entity';
import { WorkoutElement } from '../modules/training/domain/workout-element.entity';
import { Workout } from '../modules/training/domain/workout.entity';
import { seedComplexes } from './complex.seeder';

export async function seedWorkouts(em: EntityManager): Promise<void> {

  const complexesMap = await seedComplexes(em);

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

  // Creation of workouts
  const workoutsToCreate = [
    {
      title: 'Entraînement Technique Lourd',
      category: 'Saison',
      description: 'Focus sur la technique avec charges lourdes',
      elements: [
        {
          type: WORKOUT_ELEMENT_TYPES.COMPLEX,
          id: 'EMOM Technique Arraché', // EMOM Technique Arraché
          order: 0,
          sets: 4,
          reps: 1,
          rest: 180,
          startWeight_percent: 80,
          endWeight_percent: 92,
        },
        {
          type: WORKOUT_ELEMENT_TYPES.EXERCISE,
          id: 'Squat Nuque',
          order: 1,
          sets: 5,
          reps: 3,
          rest: 180,
          startWeight_percent: 85,
        },
        {
          type: WORKOUT_ELEMENT_TYPES.COMPLEX,
          id: 'Complex Épaulé-Jeté', // Complex Épaulé-Jeté
          order: 2,
          sets: 3,
          reps: 1,
          rest: 180,
          startWeight_percent: 75,
        },
        {
          type: WORKOUT_ELEMENT_TYPES.EXERCISE,
          id: 'Développé Militaire',
          order: 3,
          sets: 3,
          reps: 8,
          rest: 120,
          startWeight_percent: 65,
        },
      ],
    },
    {
      title: 'Décharge Technique',
      category: 'Décharge',
      description: 'Maintien technique à intensité modérée',
      elements: [
        {
          type: WORKOUT_ELEMENT_TYPES.COMPLEX,
          id: 'Technique Arraché Complet', // Technique Arraché Complet
          order: 0,
          sets: 3,
          reps: 2,
          rest: 120,
          startWeight_percent: 65,
        },
        {
          type: WORKOUT_ELEMENT_TYPES.EXERCISE,
          id: 'Squat Clavicule',
          order: 1,
          sets: 3,
          reps: 5,
          rest: 120,
          startWeight_percent: 70,
        },
        {
          type: WORKOUT_ELEMENT_TYPES.COMPLEX,
          id: 'EMOM Épaulé', // EMOM Épaulé
          order: 2,
          sets: 3,
          reps: 2,
          rest: 120,
          startWeight_percent: 65,
        },
        {
          type: WORKOUT_ELEMENT_TYPES.EXERCISE,
          id: 'Tirage Planche',
          order: 3,
          sets: 3,
          reps: 10,
          rest: 90,
          startWeight_percent: 60,
        },
      ],
    },
    {
      title: 'Préparation Physique',
      category: 'Fond',
      description: 'Développement des qualités physiques',
      elements: [
        {
          type: WORKOUT_ELEMENT_TYPES.COMPLEX,
          id: 'TABATA Force', // TABATA Force
          order: 0,
          sets: 4,
          reps: 1,
          rest: 60,
          startWeight_percent: 60,
        },
        {
          type: WORKOUT_ELEMENT_TYPES.EXERCISE,
          id: 'Développé Couché',
          order: 1,
          sets: 4,
          reps: 8,
          rest: 90,
          startWeight_percent: 70,
        },
        {
          type: WORKOUT_ELEMENT_TYPES.EXERCISE,
          id: 'Tirage Planche',
          order: 2,
          sets: 4,
          reps: 10,
          rest: 90,
          startWeight_percent: 65,
        },
      ],
    },
  ];

  for (const workoutData of workoutsToCreate) {
    const workout = new Workout();
    workout.title = workoutData.title;
    workout.description = workoutData.description;
    workout.category = workoutCategoriesMap[workoutData.category];
    workout.createdBy = null;

    await em.persistAndFlush(workout);

    for (const element of workoutData.elements) {
      const workoutElement = new WorkoutElement();
      workoutElement.type = element.type;
      workoutElement.order = element.order;
      workoutElement.workout = workout;
      workoutElement.sets = element.sets;
      workoutElement.reps = element.reps;
      workoutElement.startWeight_percent = element.startWeight_percent;

      if (element.type === WORKOUT_ELEMENT_TYPES.EXERCISE) {
        workoutElement.exercise = exercisesMap[element.id];
        if (!workoutElement.exercise) {
          console.warn(`Exercise ${element.id} not found, skipping element`);
          continue;
        }
      } else {
        // Trouver le complex par son nom
        const complex = await em.findOne(Complex, {
          name: element.id,
        });
        if (!complex) {
          console.warn(`Complex ${element.id} not found, skipping element`);
          continue;
        }
        workoutElement.complex = complex;
      }

      em.persist(workoutElement);
    }

    console.log('Workout created:', workout.title);
  }
}
