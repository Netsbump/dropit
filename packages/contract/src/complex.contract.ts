import { complexSchema, createComplexSchema } from '@dropit/schemas';
import { z } from 'zod';

export const complexContract = {
  getComplexes: {
    method: 'GET',
    path: '/complex',
    summary: 'Get all complexes',
    responses: {
      200: z.array(complexSchema),
    },
    404: z.object({
      message: z.string(),
    }),
    500: z.object({
      message: z.string(),
    }),
  },

  getComplex: {
    method: 'GET',
    path: '/complex/:id',
    summary: 'Get a complex by id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: complexSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  createComplex: {
    method: 'POST',
    path: '/complex',
    summary: 'Create a complex',
    body: createComplexSchema,
    responses: {
      201: complexSchema,
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
} as const;
