import {
  createPhysicalMetricSchema,
  physicalMetricSchema,
  updatePhysicalMetricSchema,
} from '@dropit/schemas';
import { z } from 'zod';

const errorResponseSchema = z.object({
  message: z.string(),
});

export const physicalMetricContract = {
  getPhysicalMetric: {
    method: 'GET',
    path: '/physical-metrics/:id',
    summary: 'Get a physical metric by id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: physicalMetricSchema,
      400: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  getAthletePhysicalMetrics: {
    method: 'GET',
    path: '/athletes/:id/physical-metrics',
    summary: 'Get physical metric history for an athlete',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(physicalMetricSchema),
      400: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  createAthletePhysicalMetric: {
    method: 'POST',
    path: '/athletes/:id/physical-metrics',
    summary: 'Record a physical metric for an athlete',
    pathParams: z.object({
      id: z.string(),
    }),
    body: createPhysicalMetricSchema,
    responses: {
      201: physicalMetricSchema,
      400: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  updatePhysicalMetric: {
    method: 'PATCH',
    path: '/physical-metrics/:id',
    summary: 'Update a physical metric',
    pathParams: z.object({
      id: z.string(),
    }),
    body: updatePhysicalMetricSchema,
    responses: {
      200: physicalMetricSchema,
      400: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  deletePhysicalMetric: {
    method: 'DELETE',
    path: '/physical-metrics/:id',
    summary: 'Delete a physical metric',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      204: z.null(),
      400: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
} as const;
