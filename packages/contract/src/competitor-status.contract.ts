import {
  competitorStatusSchema,
  createCompetitorStatusSchema,
  updateCompetitorStatusSchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const competitorStatusContract = {
  getCompetitorStatuses: {
    method: 'GET',
    path: '/competitor-statuses',
    summary: 'Get all competitor statuses',
    responses: {
      200: z.array(competitorStatusSchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getCompetitorStatus: {
    method: 'GET',
    path: '/athletes/:id/competitor-statuses/active',
    summary: 'Get the active competitor status for an athlete',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: competitorStatusSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  createCompetitorStatus: {
    method: 'POST',
    path: '/athletes/:id/competitor-statuses',
    summary: 'Create a competitor status for an athlete',
    pathParams: z.object({
      id: z.string(),
    }),
    body: createCompetitorStatusSchema,
    responses: {
      201: competitorStatusSchema,
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

  updateCompetitorStatus: {
    method: 'PATCH',
    path: '/competitor-statuses/:id',
    summary: 'Update a competitor status',
    pathParams: z.object({
      id: z.string(),
    }),
    body: updateCompetitorStatusSchema,
    responses: {
      200: competitorStatusSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },
} as const;
