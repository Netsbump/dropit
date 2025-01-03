import { z } from 'zod';

export const createExerciseSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  exerciseCategory: z.string(),
  video: z.string().optional(),
  englishName: z.string().optional(),
  shortName: z.string().optional(),
});

export type CreateExercise = z.infer<typeof createExerciseSchema>;

export const updateExerciseSchema = createExerciseSchema.partial();

export type UpdateExercise = z.infer<typeof updateExerciseSchema>;

export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  exerciseCategory: z.object({
    id: z.string(),
    name: z.string(),
  }),
  video: z.string().optional(),
  description: z.string().optional(),
  englishName: z.string().optional(),
  shortName: z.string().optional(),
});

export type ExerciseDto = z.infer<typeof exerciseSchema>;
