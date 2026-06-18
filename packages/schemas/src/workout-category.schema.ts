import { z } from 'zod';

export const createWorkoutCategorySchema = z.object({
  name: z.string(),
});

export type CreateWorkoutCategoryInput = z.infer<
  typeof createWorkoutCategorySchema
>;

export const updateWorkoutCategorySchema = createWorkoutCategorySchema;

export type UpdateWorkoutCategoryInput = z.infer<
  typeof updateWorkoutCategorySchema
>;

export const workoutCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type WorkoutCategoryDto = z.infer<typeof workoutCategorySchema>;
