import { initContract } from '@ts-rest/core';
import { complexContract } from './complex.contract';
import { exerciseCategoryContract } from './exercise-category.contract';
import { exerciseContract } from './exercise.contract';

const c = initContract();

export const apiContract = c.router({
  exercise: exerciseContract,
  exerciseCategory: exerciseCategoryContract,
  complex: complexContract,
});

export * from './exercise.contract';
export * from './exercise-category.contract';
export * from './complex.contract';
