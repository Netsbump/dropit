import {
  createPersonalRecordSchema,
  personalRecordSchema,
  personalRecordsSummarySchema,
  updatePersonalRecordSchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const personalRecordContract = {
  getPersonalRecords: {
    method: 'GET',
    path: '/personal-record',
    summary: 'Get all personal records',
    responses: {
      200: z.array(personalRecordSchema),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getPersonalRecord: {
    method: 'GET',
    path: '/personal-record/:id',
    summary: 'Get a personal record by id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: personalRecordSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getAthletePersonalRecords: {
    method: 'GET',
    path: '/athlete/:id/personal-records',
    summary: 'Get all personal records for an athlete',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(personalRecordSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getAthletePersonalRecordsSummary: {
    method: 'GET',
    path: '/athlete/:id/personal-records/summary',
    summary: 'Get summary of personal records for an athlete',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: personalRecordsSummarySchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  createPersonalRecord: {
    method: 'POST',
    path: '/personal-record',
    summary: 'Create a personal record',
    body: createPersonalRecordSchema,
    responses: {
      201: personalRecordSchema,
      400: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  updatePersonalRecord: {
    method: 'PATCH',
    path: '/personal-record/:id',
    summary: 'Update a personal record',
    pathParams: z.object({
      id: z.string(),
    }),
    body: updatePersonalRecordSchema,
    responses: {
      200: personalRecordSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  deletePersonalRecord: {
    method: 'DELETE',
    path: '/personal-record/:id',
    summary: 'Delete a personal record',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      204: z.null(),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },
} as const;
