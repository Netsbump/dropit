import {
  athleteSessionSchema,
  createAthleteSessionSchema,
  updateAthleteSessionSchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const athleteSessionContract = {
  getAthleteSessions: {
    method: 'GET',
    path: '/athlete-session',
    summary: 'Get all athlete sessions',
    responses: {
      200: z.array(athleteSessionSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getAthleteSession: {
    method: 'GET',
    path: '/athlete-session/athlete/:athleteId/session/:sessionId',
    summary: 'Get an athlete session by athlete and session IDs',
    pathParams: z.object({
      athleteId: z.string(),
      sessionId: z.string(),
    }),
    responses: {
      200: athleteSessionSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getAthleteSessionsByAthlete: {
    method: 'GET',
    path: '/athlete-session/athlete/:athleteId',
    summary: 'Get athlete sessions by athlete id',
    pathParams: z.object({
      athleteId: z.string(),
    }),
    responses: {
      200: z.array(athleteSessionSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getAthleteSessionsBySession: {
    method: 'GET',
    path: '/athlete-session/session/:sessionId',
    summary: 'Get athlete sessions by session id',
    pathParams: z.object({
      sessionId: z.string(),
    }),
    responses: {
      200: z.array(athleteSessionSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  createAthleteSession: {
    method: 'POST',
    path: '/athlete-session',
    summary: 'Create an athlete session',
    body: createAthleteSessionSchema,
    responses: {
      201: athleteSessionSchema,
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

  updateAthleteSession: {
    method: 'PATCH',
    path: '/athlete-session/athlete/:athleteId/session/:sessionId',
    summary: 'Update an athlete session',
    pathParams: z.object({
      athleteId: z.string(),
      sessionId: z.string(),
    }),
    body: updateAthleteSessionSchema,
    responses: {
      200: athleteSessionSchema,
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

  deleteAthleteSession: {
    method: 'DELETE',
    path: '/athlete-session/athlete/:athleteId/session/:sessionId',
    summary: 'Delete an athlete session',
    pathParams: z.object({
      athleteId: z.string(),
      sessionId: z.string(),
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
