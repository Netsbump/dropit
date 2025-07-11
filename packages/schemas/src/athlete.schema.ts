import { z } from 'zod';

export const createAthleteSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.string().or(z.date()),
  country: z.string().optional(),
});

export type CreateAthlete = z.infer<typeof createAthleteSchema>;

export const updateAthleteSchema = createAthleteSchema.partial();

export type UpdateAthlete = z.infer<typeof updateAthleteSchema>;

export const athleteSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.date(),
  userId: z.string(),
});

export type AthleteDto = z.infer<typeof athleteSchema>;

export const athleteDetailsSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  image: z.string().optional(),
  birthday: z.date(),
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

// Schéma simplifié pour l'affichage dans les listes
export const athleteListItemSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  userId: z.string(),
});

export type AthleteListItemDto = z.infer<typeof athleteListItemSchema>;
