import { z } from 'zod';

export const createExerciseSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  exerciseType: z.number(),
  video: z.number().optional(),
  englishName: z.string().optional(),
  shortName: z.string().optional(),
});

export type CreateExercise = z.infer<typeof createExerciseSchema>;

export const updateExerciseSchema = createExerciseSchema.partial();

export type UpdateExercise = z.infer<typeof updateExerciseSchema>;

export const exerciseTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  exerciseType: z.object({
    id: z.number(),
    name: z.string(),
  }),
  video: z.number().optional(),
  description: z.string().optional(),
  englishName: z.string().optional(),
  shortName: z.string().optional(),
});

export type ExerciseResponse = z.infer<typeof exerciseTypeSchema>;
