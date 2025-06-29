import { initContract } from '@ts-rest/core';
import { athleteTrainingSessionContract } from './athlete-training-session.contract';
import { athleteContract } from './athlete.contract';
import { competitorStatusContract } from './competitor-status.contract';
import { complexCategoryContract } from './complex-category.contract';
import { complexContract } from './complex.contract';
import { exerciseCategoryContract } from './exercise-category.contract';
import { exerciseContract } from './exercise.contract';
import { personalRecordContract } from './personal-record.contract';
import { trainingSessionContract } from './training-session.contract';
import { workoutCategoryContract } from './workout-category.contract';
import { workoutContract } from './workout.contract';

const c = initContract();

export const apiContract = c.router({
  athlete: athleteContract,
  athleteTrainingSession: athleteTrainingSessionContract,
  exercise: exerciseContract,
  exerciseCategory: exerciseCategoryContract,
  complex: complexContract,
  complexCategory: complexCategoryContract,
  trainingSession: trainingSessionContract,
  workoutCategory: workoutCategoryContract,
  workout: workoutContract,
  competitorStatus: competitorStatusContract,
  personalRecord: personalRecordContract,
});

export * from './athlete.contract';
export * from './athlete-training-session.contract';
export * from './exercise.contract';
export * from './exercise-category.contract';
export * from './complex.contract';
export * from './complex-category.contract';
export * from './training-session.contract';
export * from './workout-category.contract';
export * from './workout.contract';
export * from './competitor-status.contract';
export * from './personal-record.contract';
