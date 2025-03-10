import {
  createExerciseSchema,
  exerciseSchema,
  updateExerciseSchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const exerciseContract = {
  getExercises: {
    method: 'GET',
    path: '/exercise',
    summary: 'Get all exercises',
    responses: {
      200: z.array(exerciseSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getExercise: {
    method: 'GET',
    path: '/exercise/:id',
    summary: 'Get an exercise by id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: exerciseSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  createExercise: {
    method: 'POST',
    path: '/exercise',
    summary: 'Create an exercise',
    body: createExerciseSchema,
    responses: {
      201: exerciseSchema,
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

  updateExercise: {
    method: 'PATCH',
    path: '/exercise/:id',
    summary: 'Update an exercise',
    pathParams: z.object({
      id: z.string(),
    }),
    body: updateExerciseSchema,
    responses: {
      200: exerciseSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  deleteExercise: {
    method: 'DELETE',
    path: '/exercise/:id',
    summary: 'Delete an exercise',
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

  searchExercises: {
    method: 'GET',
    path: '/exercise/search',
    summary: 'Search for exercises',
    query: z.object({
      like: z.string(),
    }),
    responses: {
      200: z.array(exerciseSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },
} as const;
