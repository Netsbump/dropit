import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const exerciseContract = c.router({
  getExercises: {
    method: 'GET',
    path: '/exercise',
    summary: 'Get all exercises',
    responses: {
      200: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          exerciseType: z.object({
            id: z.number(),
            name: z.string(),
          }),
          video: z.string().optional(),
          description: z.string(),
          englishName: z.string(),
          shortName: z.string(),
        })
      ),
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
      200: z.object({
        id: z.number(),
        name: z.string(),
        exerciseType: z.object({
          id: z.number(),
          name: z.string(),
        }),
        video: z.string().optional(),
        description: z.string().optional(),
        englishName: z.string().optional(),
        shortName: z.string().optional(),
      }),
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
    body: z.object({
      name: z.string(),
      description: z.string().optional(),
      exerciseType: z.number(),
      video: z.number().optional(),
      englishName: z.string().optional(),
      shortName: z.string().optional(),
    }),
    responses: {
      201: z.object({
        id: z.number(),
        name: z.string(),
        description: z.string().optional(),
        exerciseType: z.object({
          id: z.number(),
          name: z.string(),
        }),
        video: z.string().optional(),
        englishName: z.string().optional(),
        shortName: z.string().optional(),
      }),
      400: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  updateExercise: {
    method: 'PUT',
    path: '/exercise/:id',
    summary: 'Update an exercise',
    pathParams: z.object({
      id: z.string(),
    }),
    body: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      exerciseType: z.string().optional(),
      video: z.string().optional(),
      englishName: z.string().optional(),
      shortName: z.string().optional(),
    }),
    responses: {
      200: z.object({
        id: z.number(),
        name: z.string(),
        exerciseType: z.object({
          id: z.number(),
          name: z.string(),
        }),
        video: z.string().optional(),
        description: z.string().optional(),
        englishName: z.string().optional(),
        shortName: z.string().optional(),
      }),
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
      200: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          exerciseType: z.object({
            id: z.number(),
            name: z.string(),
          }),
          video: z.string().optional(),
          description: z.string().optional(),
          englishName: z.string().optional(),
          shortName: z.string().optional(),
        })
      ),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },
});
