import {
  competitorStatusSchema,
  createCompetitorStatusSchema,
  updateCompetitorStatusSchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const competitorStatusContract = {
  getCompetitorStatuses: {
    method: 'GET',
    path: '/competitor-status',
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
    path: '/competitor-status/:id',
    summary: 'Get a competitor status by id',
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
    path: '/competitor-status',
    summary: 'Create a competitor status',
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
    path: '/competitor-status/:id',
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
