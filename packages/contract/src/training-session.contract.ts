import {
  createTrainingSessionSchema,
  trainingSessionSchema,
  updateTrainingSessionSchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const trainingSessionContract = {
  getTrainingSessions: {
    method: 'GET',
    path: '/training-session',
    summary: 'Get all training sessions',
    responses: {
      200: z.array(trainingSessionSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getTrainingSession: {
    method: 'GET',
    path: '/training-session/:id',
    summary: 'Get a training session by id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: trainingSessionSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getTrainingSessionsByAthlete: {
    method: 'GET',
    path: '/training-session/athlete/:athleteId',
    summary: 'Get training sessions by athlete id',
    pathParams: z.object({
      athleteId: z.string(),
    }),
    responses: {
      200: z.array(trainingSessionSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  createTrainingSession: {
    method: 'POST',
    path: '/training-session',
    summary: 'Create a training session',
    body: createTrainingSessionSchema,
    responses: {
      201: trainingSessionSchema,
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

  updateTrainingSession: {
    method: 'PATCH',
    path: '/training-session/:id',
    summary: 'Update a training session',
    pathParams: z.object({
      id: z.string(),
    }),
    body: updateTrainingSessionSchema,
    responses: {
      200: trainingSessionSchema,
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

  completeTrainingSession: {
    method: 'PATCH',
    path: '/training-session/:id/complete',
    summary: 'Mark a training session as completed',
    pathParams: z.object({
      id: z.string(),
    }),
    body: z.object({
      completedDate: z.string().or(z.date()).optional(),
      notes: z.string().optional(),
    }),
    responses: {
      200: trainingSessionSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  deleteTrainingSession: {
    method: 'DELETE',
    path: '/training-session/:id',
    summary: 'Delete a training session',
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
