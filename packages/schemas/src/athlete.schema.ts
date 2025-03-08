import { z } from 'zod';

export const createAthleteSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
});

export type CreateAthlete = z.infer<typeof createAthleteSchema>;

export const updateAthleteSchema = createAthleteSchema.partial();

export type UpdateAthlete = z.infer<typeof updateAthleteSchema>;

export const athleteSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type AthleteDto = z.infer<typeof athleteSchema>;
