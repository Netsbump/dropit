import {
  athleteTrainingSessionSchema,
  createAthleteTrainingSessionSchema,
  updateAthleteTrainingSessionSchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const athleteTrainingSessionContract = {
  getAthleteTrainingSessions: {
    method: 'GET',
    path: '/athlete-training-session',
    summary: 'Get all athlete training sessions',
    responses: {
      200: z.array(athleteTrainingSessionSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getAthleteTrainingSession: {
    method: 'GET',
    path: '/athlete-training-session/athlete/:athleteId/training-session/:trainingSessionId',
    summary: 'Get an athlete training session by athlete and training session IDs',
    pathParams: z.object({
      athleteId: z.string(),
      trainingSessionId: z.string(),
    }),
    responses: {
      200: athleteTrainingSessionSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getAthleteTrainingSessionsByAthlete: {
    method: 'GET',
    path: '/athlete-training-session/athlete/:athleteId',
    summary: 'Get athlete training sessions by athlete id',
    pathParams: z.object({
      athleteId: z.string(),
    }),
    responses: {
      200: z.array(athleteTrainingSessionSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getAthleteTrainingSessionsByTrainingSession: {
    method: 'GET',
    path: '/athlete-training-session/training-session/:trainingSessionId',
    summary: 'Get athlete training sessions by training session id',
    pathParams: z.object({
        trainingSessionId: z.string(),
    }),
    responses: {
      200: z.array(athleteTrainingSessionSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  createAthleteTrainingSession: {
    method: 'POST',
    path: '/athlete-training-session',
    summary: 'Create an athlete training session',
    body: createAthleteTrainingSessionSchema,
    responses: {
      201: athleteTrainingSessionSchema,
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

  updateAthleteTrainingSession: {
    method: 'PATCH',
    path: '/athlete-training-session/athlete/:athleteId/training-session/:trainingSessionId',
    summary: 'Update an athlete training session',
    pathParams: z.object({
      athleteId: z.string(),
      trainingSessionId: z.string(),
    }),
    body: updateAthleteTrainingSessionSchema,
    responses: {
      200: athleteTrainingSessionSchema,
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

  deleteAthleteTrainingSession: {
    method: 'DELETE',
    path: '/athlete-training-session/athlete/:athleteId/training-session/:trainingSessionId',
    summary: 'Delete an athlete training session',
    pathParams: z.object({
      athleteId: z.string(),
      trainingSessionId: z.string(),
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
