import { z } from 'zod';
import { athleteSessionSchema } from './athlete-session.schema';
import { athleteSchema } from './athlete.schema';
import { workoutSchema } from './workout.schema';

export const createSessionSchema = z.object({
  workoutId: z.string(),
  athleteIds: z.array(z.string()),
  scheduledDate: z.string().or(z.date()),
});

export type CreateSession = z.infer<typeof createSessionSchema>;

export const updateSessionSchema = z.object({
  workoutId: z.string().optional(),
  athleteIds: z.array(z.string()).optional(),
  scheduledDate: z.string().or(z.date()).optional(),
  completedDate: z.string().or(z.date()).optional(),
});

export type UpdateSession = z.infer<typeof updateSessionSchema>;

export const sessionSchema = z.object({
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
  athleteSessions: z.array(athleteSessionSchema).optional(),
  scheduledDate: z.string().or(z.date()),
  completedDate: z.string().or(z.date()).optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type SessionDto = z.infer<typeof sessionSchema>;
