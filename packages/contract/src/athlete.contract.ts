import {
  athleteDetailsSchema,
  athleteListQuerySchema,
  athleteSchema,
  athletesByOrganizationParamsSchema,
  createAthleteInvitationSchema,
  createAthleteSchema,
  paginatedAdminOrganizationAthleteSchema,
  paginatedAthleteDetailsSchema,
  updateAthleteSchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const athleteContract = {
  getAthletes: {
    method: 'GET',
    path: '/athletes',
    summary: 'List athletes',
    query: athleteListQuerySchema,
    responses: {
      200: paginatedAthleteDetailsSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  getAthletesByOrganization: {
    method: 'GET',
    path: '/organizations/:organizationId/athletes',
    summary: 'List athletes for an organization (admin)',
    pathParams: athletesByOrganizationParamsSchema,
    query: athleteListQuerySchema,
    responses: {
      200: paginatedAdminOrganizationAthleteSchema,
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

  getAthlete: {
    method: 'GET',
    path: '/athletes/:id',
    summary: 'Get an athlete by id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: athleteDetailsSchema,
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },

  createAthlete: {
    method: 'POST',
    path: '/athletes',
    summary: 'Create an athlete',
    body: createAthleteSchema,
    responses: {
      201: athleteSchema,
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

  inviteAthlete: {
    method: 'POST',
    path: '/athletes/invitations',
    summary: 'Invite an athlete by email',
    body: createAthleteInvitationSchema,
    responses: {
      201: z.object({ message: z.string() }),
      400: z.object({ message: z.string() }),
      403: z.object({ message: z.string() }),
      500: z.object({ message: z.string() }),
    },
  },

  updateAthlete: {
    method: 'PATCH',
    path: '/athletes/:id',
    summary: 'Update an athlete',
    pathParams: z.object({
      id: z.string(),
    }),
    body: updateAthleteSchema,
    responses: {
      200: athleteSchema,
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

  deleteAthlete: {
    method: 'DELETE',
    path: '/athletes/:id',
    summary: 'Delete an athlete',
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
