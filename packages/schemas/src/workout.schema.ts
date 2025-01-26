import { z } from 'zod';
import { trainingParamsSchema } from './training-params.schema';

const workoutExerciseElement = z.object({
  type: z.literal('exercise'),
  id: z.string(),
  order: z.number().min(0),
  trainingParams: trainingParamsSchema,
});

const workoutComplexElement = z.object({
  type: z.literal('complex'),
  id: z.string(),
  order: z.number().min(0),
  trainingParams: trainingParamsSchema,
});

const workoutElementSchema = z.discriminatedUnion('type', [
  workoutExerciseElement,
  workoutComplexElement,
]);

export const createWorkoutSchema = z.object({
  title: z.string(),
  workoutCategory: z.string(),
  description: z.string().optional(),
  elements: z.array(workoutElementSchema),
});

export type CreateWorkout = z.infer<typeof createWorkoutSchema>;

export const updateWorkoutSchema = createWorkoutSchema.partial();

export type UpdateWorkout = z.infer<typeof updateWorkoutSchema>;

export const workoutSchema = z.object({
  id: z.string(),
  title: z.string(),
  workoutCategory: z.string(),
  description: z.string().optional(),
  elements: z.array(workoutElementSchema),
});

export type WorkoutDto = z.infer<typeof workoutSchema>;
