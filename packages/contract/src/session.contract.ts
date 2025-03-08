import {
  createSessionSchema,
  sessionSchema,
  updateSessionSchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const sessionContract = {
  getSessions: {
    method: 'GET',
    path: '/session',
    summary: 'Get all sessions',
    responses: {
      200: z.array(sessionSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getSession: {
    method: 'GET',
    path: '/session/:id',
    summary: 'Get a session by id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: sessionSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getSessionsByAthlete: {
    method: 'GET',
    path: '/session/athlete/:athleteId',
    summary: 'Get sessions by athlete id',
    pathParams: z.object({
      athleteId: z.string(),
    }),
    responses: {
      200: z.array(sessionSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  createSession: {
    method: 'POST',
    path: '/session',
    summary: 'Create a session',
    body: createSessionSchema,
    responses: {
      201: sessionSchema,
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

  updateSession: {
    method: 'PATCH',
    path: '/session/:id',
    summary: 'Update a session',
    pathParams: z.object({
      id: z.string(),
    }),
    body: updateSessionSchema,
    responses: {
      200: sessionSchema,
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

  completeSession: {
    method: 'PATCH',
    path: '/session/:id/complete',
    summary: 'Mark a session as completed',
    pathParams: z.object({
      id: z.string(),
    }),
    body: z.object({
      completedDate: z.string().or(z.date()).optional(),
      notes: z.string().optional(),
    }),
    responses: {
      200: sessionSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  deleteSession: {
    method: 'DELETE',
    path: '/session/:id',
    summary: 'Delete a session',
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
