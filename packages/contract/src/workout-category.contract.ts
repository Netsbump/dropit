import {
  createWorkoutCategorySchema,
  updateWorkoutCategorySchema,
  workoutCategorySchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const workoutCategoryContract = {
  getWorkoutCategories: {
    method: 'GET',
    path: '/workout-category',
    summary: 'Get all workout categories',
    responses: {
      200: z.array(workoutCategorySchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getWorkoutCategory: {
    method: 'GET',
    path: '/workout-category/:id',
    summary: 'Get a workout category by id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: workoutCategorySchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  createWorkoutCategory: {
    method: 'POST',
    path: '/workout-category',
    summary: 'Create a workout category',
    body: createWorkoutCategorySchema,
    responses: {
      201: workoutCategorySchema,
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

  updateWorkoutCategory: {
    method: 'PATCH',
    path: '/workout-category/:id',
    summary: 'Update a workout category',
    pathParams: z.object({
      id: z.string(),
    }),
    body: updateWorkoutCategorySchema,
    responses: {
      200: workoutCategorySchema,
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

  deleteWorkoutCategory: {
    method: 'DELETE',
    path: '/workout-category/:id',
    summary: 'Delete a workout category',
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
