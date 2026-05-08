import { z } from 'zod';

export const createExerciseCategorySchema = z.object({
  name: z.string(),
});

export type CreateExerciseCategoryInput = z.infer<
  typeof createExerciseCategorySchema
>;

export const updateExerciseCategorySchema = createExerciseCategorySchema;

export type UpdateExerciseCategoryInput = z.infer<
  typeof updateExerciseCategorySchema
>;

export const exerciseCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type ExerciseCategoryDto = z.infer<typeof exerciseCategorySchema>;
