import { z } from 'zod';
import { workoutSchema } from './workout.schema';

export const createTrainingSessionSchema = z.object({
  workoutId: z.string(),
  athleteIds: z.array(z.string()),
  scheduledDate: z.string().or(z.date()),
});

export type CreateTrainingSession = z.infer<typeof createTrainingSessionSchema>;

export const updateTrainingSessionSchema = z.object({
  workoutId: z.string().optional(),
  athleteIds: z.array(z.string()).optional(),
  scheduledDate: z.string().or(z.date()).optional(),
  completedDate: z.string().or(z.date()).optional(),
});

export type UpdateTrainingSession = z.infer<typeof updateTrainingSessionSchema>;

export const trainingSessionSchema = z.object({
  id: z.string(),
  workout: workoutSchema,
  athletes: z
    .array(
      z.object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
      })
    )
    .optional(),
  scheduledDate: z.string().or(z.date()),
  completedDate: z.string().or(z.date()).optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type TrainingSessionDto = z.infer<typeof trainingSessionSchema>;
