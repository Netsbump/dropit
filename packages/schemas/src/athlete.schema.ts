import { z } from 'zod';

export const createAthleteSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.string().or(z.date()),
  country: z.string().optional(),
  clubId: z.string().optional(),
  userId: z.string().optional(),
});

export type CreateAthlete = z.infer<typeof createAthleteSchema>;

export const updateAthleteSchema = createAthleteSchema.partial();

export type UpdateAthlete = z.infer<typeof updateAthleteSchema>;

export const athleteSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.string().or(z.date()),
  country: z.string().optional(),
  clubId: z.string().optional(),
  userId: z.string().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type AthleteDto = z.infer<typeof athleteSchema>;

// Schéma simplifié pour l'affichage dans les listes
export const athleteListItemSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

export type AthleteListItemDto = z.infer<typeof athleteListItemSchema>;
