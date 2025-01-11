import {
  createExerciseCategorySchema,
  exerciseCategorySchema,
  updateExerciseCategorySchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const exerciseCategoryContract = {
  getExerciseCategories: {
    method: 'GET',
    path: '/exercise-category',
    summary: 'Get all exercise categories',
    responses: {
      200: z.array(exerciseCategorySchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getExerciseCategory: {
    method: 'GET',
    path: '/exercise-category/:id',
    summary: 'Get an exercise category by id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: exerciseCategorySchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  createExerciseCategory: {
    method: 'POST',
    path: '/exercise-category',
    summary: 'Create an exercise category',
    body: createExerciseCategorySchema,
    responses: {
      201: exerciseCategorySchema,
      400: z.object({
        message: z.string(),
      }),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  updateExerciseCategory: {
    method: 'PATCH',
    path: '/exercise-category/:id',
    summary: 'Update an exercise category',
    pathParams: z.object({
      id: z.string(),
    }),
    body: updateExerciseCategorySchema,
    responses: {
      200: exerciseCategorySchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  deleteExerciseCategory: {
    method: 'DELETE',
    path: '/exercise-category/:id',
    summary: 'Delete an exercise category',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.object({
        message: z.string(),
      }),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },
} as const;
