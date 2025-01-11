import { initContract } from '@ts-rest/core';
import { exerciseCategoryContract } from './exercise-category.contract';
import { exerciseContract } from './exercise.contract';

const c = initContract();

export const apiContract = c.router({
  exercise: exerciseContract,
  exerciseCategory: exerciseCategoryContract,
});

export * from './exercise.contract';
export * from './exercise-category.contract';
