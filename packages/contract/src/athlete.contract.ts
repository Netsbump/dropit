import {
  athleteDetailsSchema,
  athleteSchema,
  createAthleteSchema,
  updateAthleteSchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const athleteContract = {
  getAthletes: {
    method: 'GET',
    path: '/athlete',
    summary: 'Get all athletes',
    responses: {
      200: z.array(athleteDetailsSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getAthlete: {
    method: 'GET',
    path: '/athlete/:id',
    summary: 'Get an athlete by id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: athleteDetailsSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  createAthlete: {
    method: 'POST',
    path: '/athlete',
    summary: 'Create an athlete',
    body: createAthleteSchema,
    responses: {
      201: athleteSchema,
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

  updateAthlete: {
    method: 'PATCH',
    path: '/athlete/:id',
    summary: 'Update an athlete',
    pathParams: z.object({
      id: z.string(),
    }),
    body: updateAthleteSchema,
    responses: {
      200: athleteSchema,
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

  deleteAthlete: {
    method: 'DELETE',
    path: '/athlete/:id',
    summary: 'Delete an athlete',
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
