//import { faker } from '@faker-js/faker';
import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { ComplexCategory } from '../entities/complex-category.entity';
import { Complex } from '../entities/complex.entity';
import { ExerciseCategory } from '../entities/exercise-category.entity';
import { ExerciseComplex } from '../entities/exercise-complex.entity';
import { Exercise } from '../entities/exercise.entity';
import { TrainingParams } from '../entities/training-params.entity';

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
            trainingParams: {
              sets: 1,
              reps: 3,
              rest: 60,
              startWeight_percent: 70,
              endWeight_percent: 70,
            },
          },
          {
            name: 'Tirage Nuque',
            trainingParams: {
              sets: 1,
              reps: 5,
              rest: 60,
              startWeight_percent: 80,
            },
          },
          {
            name: 'Squat Clavicule',
            trainingParams: {
              sets: 1,
              reps: 2,
              rest: 60,
              startWeight_percent: 75,
            },
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
            trainingParams: {
              sets: 4,
              reps: 3,
              rest: 120,
              startWeight_percent: 70,
              endWeight_percent: 80,
            },
          },
          {
            name: 'Jeté Fente',
            trainingParams: {
              sets: 4,
              reps: 2,
              rest: 120,
              startWeight_percent: 70,
              endWeight_percent: 80,
            },
          },
          {
            name: 'Squat Clavicule',
            trainingParams: {
              sets: 3,
              reps: 5,
              rest: 90,
              startWeight_percent: 80,
            },
          },
          {
            name: 'Développé Militaire',
            trainingParams: {
              sets: 3,
              reps: 8,
              rest: 90,
              startWeight_percent: 60,
            },
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
            trainingParams: {
              sets: 8,
              reps: 6,
              rest: 10, // TABATA: 20s effort / 10s repos
              startWeight_percent: 65,
            },
          },
          {
            name: 'Développé Militaire',
            trainingParams: {
              sets: 8,
              reps: 8,
              rest: 10,
              startWeight_percent: 50,
            },
          },
          {
            name: 'Soulevé de Terre',
            trainingParams: {
              sets: 8,
              reps: 4,
              rest: 10,
              startWeight_percent: 70,
            },
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
            trainingParams: {
              sets: 5,
              reps: 2,
              rest: 180, // Repos long pour la technique
              startWeight_percent: 65,
              endWeight_percent: 75,
            },
          },
          {
            name: 'Tirage Nuque',
            trainingParams: {
              sets: 4,
              reps: 4,
              rest: 120,
              startWeight_percent: 80,
            },
          },
          {
            name: 'Squat Nuque',
            trainingParams: {
              sets: 3,
              reps: 5,
              rest: 120,
              startWeight_percent: 85,
            },
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
            trainingParams: {
              sets: 1,
              reps: 2,
              rest: 60, // EMOM: 1 minute par round
              startWeight_percent: 75,
            },
          },
          {
            name: 'Squat Clavicule',
            trainingParams: {
              sets: 1,
              reps: 3,
              rest: 60,
              startWeight_percent: 70,
            },
          },
          {
            name: 'Développé Militaire',
            trainingParams: {
              sets: 1,
              reps: 5,
              rest: 60,
              startWeight_percent: 60,
            },
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

        // Créer les paramètres d'entraînement
        const trainingParams = new TrainingParams();
        trainingParams.sets = exerciseData.trainingParams.sets;
        trainingParams.reps = exerciseData.trainingParams.reps;
        trainingParams.rest = exerciseData.trainingParams.rest;
        trainingParams.startWeight_percent =
          exerciseData.trainingParams.startWeight_percent;
        trainingParams.endWeight_percent =
          exerciseData.trainingParams.endWeight_percent;

        await em.persist(trainingParams);

        const exerciseComplex = new ExerciseComplex();
        exerciseComplex.complex = complex;
        exerciseComplex.exercise = exercisesMap[exerciseData.name];
        exerciseComplex.order = i;
        exerciseComplex.trainingParams = trainingParams;

        await em.persistAndFlush(exerciseComplex);
      }

      console.log('Complex created:', complex.name);
    }
  }
}
