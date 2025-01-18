import {
  complexCategorySchema,
  createComplexCategorySchema,
  updateComplexCategorySchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const complexCategoryContract = {
  getComplexCategories: {
    method: 'GET',
    path: '/complex-category',
    summary: 'Get all complex categories',
    responses: {
      200: z.array(complexCategorySchema),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getComplexCategory: {
    method: 'GET',
    path: '/complex-category/:id',
    summary: 'Get a complex category by id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: complexCategorySchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  createComplexCategory: {
    method: 'POST',
    path: '/complex-category',
    summary: 'Create a complex category',
    body: createComplexCategorySchema,
    responses: {
      201: complexCategorySchema,
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

  updateComplexCategory: {
    method: 'PATCH',
    path: '/complex-category/:id',
    summary: 'Update a complex category',
    pathParams: z.object({
      id: z.string(),
    }),
    body: updateComplexCategorySchema,
    responses: {
      200: complexCategorySchema,
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

  deleteComplexCategory: {
    method: 'DELETE',
    path: '/complex-category/:id',
    summary: 'Delete a complex category',
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
