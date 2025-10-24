import {
  userSchema,
  updateUserSchema,
  deleteUserSchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const userContract = {
  getMe: {
    method: 'GET',
    path: '/user/me',
    summary: 'Get current user profile',
    responses: {
      200: userSchema,
      401: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  updateMe: {
    method: 'PATCH',
    path: '/user/me',
    summary: 'Update current user profile',
    body: updateUserSchema,
    responses: {
      200: userSchema,
      400: z.object({
        message: z.string(),
      }),
      401: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  deleteMe: {
    method: 'DELETE',
    path: '/user/me',
    summary: 'Delete current user account',
    body: deleteUserSchema,
    responses: {
      200: z.object({
        message: z.string(),
      }),
      400: z.object({
        message: z.string(),
      }),
      401: z.object({
        message: z.string(),
      }),
      403: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },
} as const;
