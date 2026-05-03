import { z } from 'zod';

export const createAthleteTrainingSessionSchema = z.object({
  athleteId: z.string(),
  trainingSessionId: z.string(),
  notes_athlete: z.string().optional(),
});

export type CreateAthleteTrainingSessionInput = z.infer<typeof createAthleteTrainingSessionSchema>;

export const updateAthleteTrainingSessionSchema = z.object({
  notes_athlete: z.string().optional(),
});

export type UpdateAthleteTrainingSessionInput = z.infer<typeof updateAthleteTrainingSessionSchema>;

export const athleteTrainingSessionSchema = z.object({
  athleteId: z.string(),
  trainingSessionId: z.string(),
  notes_athlete: z.string().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type AthleteTrainingSessionDto = z.infer<typeof athleteTrainingSessionSchema>;
