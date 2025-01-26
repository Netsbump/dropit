import { initContract } from '@ts-rest/core';
import { complexCategoryContract } from './complex-category.contract';
import { complexContract } from './complex.contract';
import { exerciseCategoryContract } from './exercise-category.contract';
import { exerciseContract } from './exercise.contract';
import { workoutCategoryContract } from './workout-category.contract';
import { workoutContract } from './workout.contract';

const c = initContract();

export const apiContract = c.router({
  exercise: exerciseContract,
  exerciseCategory: exerciseCategoryContract,
  complex: complexContract,
  complexCategory: complexCategoryContract,
  workoutCategory: workoutCategoryContract,
  workout: workoutContract,
});

export * from './exercise.contract';
export * from './exercise-category.contract';
export * from './complex.contract';
export * from './complex-category.contract';
export * from './workout-category.contract';
export * from './workout.contract';
