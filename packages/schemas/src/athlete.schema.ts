import { z } from 'zod';
import {
  paginationMetadataSchema,
  paginationQuerySchema,
} from './common.schema';

export const createAthleteSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.string().or(z.date()).optional(),
  country: z.string().optional(),
});

export type CreateAthleteInput = z.infer<typeof createAthleteSchema>;

export const updateAthleteSchema = createAthleteSchema.partial();

export type UpdateAthleteInput = z.infer<typeof updateAthleteSchema>;

export const athleteSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.date().optional(),
  userId: z.string(),
});

export type AthleteDto = z.infer<typeof athleteSchema>;

export const athleteDetailsSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  image: z.string().optional(),
  birthday: z.date().optional(),
  country: z.string().optional(),
  metrics: z
    .object({
      weight: z.number().optional(),
    })
    .optional(),
  personalRecords: z
    .object({
      snatch: z.number().optional(),
      cleanAndJerk: z.number().optional(),
    })
    .optional(),
  competitorStatus: z
    .object({
      level: z.string(),
      sexCategory: z.string(),
      weightCategory: z.number().optional(),
    })
    .optional(),
});

export type AthleteDetailsDto = z.infer<typeof athleteDetailsSchema>;

const optionalSearchSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.string().trim().optional()
);

export const athleteListQuerySchema = paginationQuerySchema.extend({
  search: optionalSearchSchema,
});

export type AthleteListQueryDto = z.infer<typeof athleteListQuerySchema>;

export const paginatedAthleteDetailsSchema = z.object({
  data: z.array(athleteDetailsSchema),
  pagination: paginationMetadataSchema,
});

export type PaginatedAthleteDetailsDto = z.infer<
  typeof paginatedAthleteDetailsSchema
>;

export const athletesByOrganizationParamsSchema = z.object({
  organizationId: z.string(),
});

export type AthletesByOrganizationParamsDto = z.infer<
  typeof athletesByOrganizationParamsSchema
>;

export const adminOrganizationAthleteSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  birthday: z.date().optional(),
});

export type AdminOrganizationAthleteDto = z.infer<
  typeof adminOrganizationAthleteSchema
>;

export const paginatedAdminOrganizationAthleteSchema = z.object({
  data: z.array(adminOrganizationAthleteSchema),
  pagination: paginationMetadataSchema,
});

export type PaginatedAdminOrganizationAthleteDto = z.infer<
  typeof paginatedAdminOrganizationAthleteSchema
>;

// Schéma simplifié pour l'affichage dans les listes
export const athleteListItemSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  userId: z.string(),
});

export type AthleteListItemDto = z.infer<typeof athleteListItemSchema>;
