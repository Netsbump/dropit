import { z } from 'zod';

export const createExerciseCategorySchema = z.object({
  name: z.string(),
});

export type CreateExerciseCategory = z.infer<
  typeof createExerciseCategorySchema
>;

export const updateExerciseCategorySchema = createExerciseCategorySchema;

export type UpdateExerciseCategory = z.infer<
  typeof updateExerciseCategorySchema
>;

export const exerciseCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type ExerciseCategoryDto = z.infer<typeof exerciseCategorySchema>;
