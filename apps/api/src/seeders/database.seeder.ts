//import { faker } from '@faker-js/faker';
import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { ComplexCategory } from '../entities/complex-category.entity';
import { Complex } from '../entities/complex.entity';
import { ExerciseCategory } from '../entities/exercise-category.entity';
import { ExerciseComplex } from '../entities/exercise-complex.entity';
import { Exercise } from '../entities/exercise.entity';

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
        description: 'EMOM 12 minutes',
        exercises: ['Arraché Debout', 'Tirage Nuque', 'Squat Clavicule'],
      },
      {
        name: 'Complex Épaulé-Jeté',
        category: 'Technique Épaulé-Jeté',
        description: '4 séries de 3 répétitions',
        exercises: [
          'Épaulé Debout',
          'Jeté Fente',
          'Squat Clavicule',
          'Développé Militaire',
        ],
      },
      {
        name: 'TABATA Force',
        category: 'TABATA',
        description: '8 rounds de 20s/10s',
        exercises: ['Squat Nuque', 'Développé Militaire', 'Soulevé de Terre'],
      },
      {
        name: 'Technique Arraché Complet',
        category: 'Technique Arraché',
        description: '5 séries de 2 répétitions',
        exercises: ['Arraché Debout', 'Tirage Nuque', 'Squat Nuque'],
      },
      {
        name: 'EMOM Épaulé',
        category: 'EMOM',
        description: 'EMOM 10 minutes',
        exercises: ['Épaulé Debout', 'Squat Clavicule', 'Développé Militaire'],
      },
    ];

    for (const complexData of complexesToCreate) {
      const complex = new Complex();
      complex.name = complexData.name;
      complex.description = complexData.description;
      complex.complexCategory = complexCategoriesMap[complexData.category];

      await em.persistAndFlush(complex);

      for (let i = 0; i < complexData.exercises.length; i++) {
        const exerciseComplex = new ExerciseComplex();
        exerciseComplex.complex = complex;
        exerciseComplex.exercise = exercisesMap[complexData.exercises[i]];
        exerciseComplex.order = i;

        await em.persistAndFlush(exerciseComplex);
      }

      console.log('Complex created:', complex.name);
    }
  }
}
