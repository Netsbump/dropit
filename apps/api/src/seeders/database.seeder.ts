//import { faker } from '@faker-js/faker';
import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { ComplexCategory } from '../entities/complex-category.entity';
import { Complex } from '../entities/complex.entity';
import { ExerciseCategory } from '../entities/exercise-category.entity';
import { ExerciseComplex } from '../entities/exercise-complex.entity';
import { Exercise } from '../entities/exercise.entity';
import { WorkoutCategory } from '../entities/workout-category.entity';
import { WORKOUT_ELEMENT_TYPES } from '../entities/workout-element.entity';
import { WorkoutElement } from '../entities/workout-element.entity';
import { Workout } from '../entities/workout.entity';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const types = ['Haltérophilie', 'Endurance', 'Cardio', 'Musculation'];
    const categories: Record<string, ExerciseCategory> = {};

    for (const exerciseCategory of types) {
      const exerciseCategoryToCreate = new ExerciseCategory();
      exerciseCategoryToCreate.name = exerciseCategory;
      await em.persistAndFlush(exerciseCategoryToCreate);
      categories[exerciseCategory] = exerciseCategoryToCreate;
      console.log('Exercise category created:', exerciseCategoryToCreate);
    }

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
        englishName: 'Clean & Jerk',
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
    }

    // Création des catégories de workout
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
      await em.persistAndFlush(categoryToCreate);
      workoutCategoriesMap[workoutCategory.name] = categoryToCreate;
      console.log('Workout category created:', categoryToCreate);
    }

    // Création des workouts
    const workoutsToCreate = [
      {
        title: 'Entraînement Technique Lourd',
        category: 'Saison',
        description: 'Focus sur la technique avec charges lourdes',
        elements: [
          {
            type: WORKOUT_ELEMENT_TYPES.COMPLEX,
            id: complexesToCreate[0].name, // EMOM Technique Arraché
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
            id: complexesToCreate[1].name, // Complex Épaulé-Jeté
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
            id: complexesToCreate[3].name, // Technique Arraché Complet
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
            id: complexesToCreate[4].name, // EMOM Épaulé
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
            id: complexesToCreate[2].name, // TABATA Force
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
        } else {
          // Trouver le complex par son nom
          const complex = await em.findOne(Complex, {
            name: element.id,
          });
          if (complex) {
            workoutElement.complex = complex;
          }
        }

        em.persist(workoutElement);
      }

      console.log('Workout created:', workout.title);
    }
  }
}
