import { initContract } from '@ts-rest/core';
import { athleteSessionContract } from './athlete-session.contract';
import { athleteContract } from './athlete.contract';
import { competitorStatusContract } from './competitor-status.contract';
import { complexCategoryContract } from './complex-category.contract';
import { complexContract } from './complex.contract';
import { exerciseCategoryContract } from './exercise-category.contract';
import { exerciseContract } from './exercise.contract';
import { sessionContract } from './session.contract';
import { workoutCategoryContract } from './workout-category.contract';
import { workoutContract } from './workout.contract';
const c = initContract();

export const apiContract = c.router({
  athlete: athleteContract,
  athleteSession: athleteSessionContract,
  exercise: exerciseContract,
  exerciseCategory: exerciseCategoryContract,
  complex: complexContract,
  complexCategory: complexCategoryContract,
  session: sessionContract,
  workoutCategory: workoutCategoryContract,
  workout: workoutContract,
  competitorStatus: competitorStatusContract,
});

export * from './athlete.contract';
export * from './athlete-session.contract';
export * from './exercise.contract';
export * from './exercise-category.contract';
export * from './complex.contract';
export * from './complex-category.contract';
export * from './session.contract';
export * from './workout-category.contract';
export * from './workout.contract';
export * from './competitor-status.contract';
