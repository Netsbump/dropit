import {
  createWorkoutSchema,
  updateWorkoutSchema,
  workoutSchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const workoutContract = {
  getWorkouts: {
    method: 'GET',
    path: '/workout',
    summary: 'Get all workouts',
    responses: {
      200: z.array(workoutSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getWorkout: {
    method: 'GET',
    path: '/workout/:id',
    summary: 'Get a workout by id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: workoutSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  createWorkout: {
    method: 'POST',
    path: '/workout',
    summary: 'Create a workout',
    body: createWorkoutSchema,
    responses: {
      201: workoutSchema,
      400: z.object({
        message: z.string(),
      }),
      403: z.object({
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

  updateWorkout: {
    method: 'PATCH',
    path: '/workout/:id',
    summary: 'Update a workout',
    pathParams: z.object({
      id: z.string(),
    }),
    body: updateWorkoutSchema,
    responses: {
      200: workoutSchema,
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

  deleteWorkout: {
    method: 'DELETE',
    path: '/workout/:id',
    summary: 'Delete a workout',
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
