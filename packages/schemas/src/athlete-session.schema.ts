import { z } from 'zod';

export const createAthleteSessionSchema = z.object({
  athleteId: z.string(),
  sessionId: z.string(),
  notes_athlete: z.string().optional(),
});

export type CreateAthleteSession = z.infer<typeof createAthleteSessionSchema>;

export const updateAthleteSessionSchema = z.object({
  notes_athlete: z.string().optional(),
});

export type UpdateAthleteSession = z.infer<typeof updateAthleteSessionSchema>;

export const athleteSessionSchema = z.object({
  athleteId: z.string(),
  sessionId: z.string(),
  notes_athlete: z.string().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type AthleteSessionDto = z.infer<typeof athleteSessionSchema>;
