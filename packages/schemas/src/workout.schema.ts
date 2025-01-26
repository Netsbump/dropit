import { z } from 'zod';
import { complexSchema } from './complex.schema';
import { exerciseSchema } from './exercice.schema';
import { trainingParamsSchema } from './training-params.schema';

export const WORKOUT_ELEMENT_TYPES = {
  EXERCISE: 'exercise',
  COMPLEX: 'complex',
} as const;

export type WorkoutElementType =
  (typeof WORKOUT_ELEMENT_TYPES)[keyof typeof WORKOUT_ELEMENT_TYPES];

const createWorkoutExerciseElement = z.object({
  type: z.literal('exercise'),
  id: z.string(),
  order: z.number().min(0),
  trainingParams: trainingParamsSchema,
});

const createWorkoutComplexElement = z.object({
  type: z.literal('complex'),
  id: z.string(),
  order: z.number().min(0),
  trainingParams: trainingParamsSchema,
});

const createWorkoutElementSchema = z.discriminatedUnion('type', [
  createWorkoutExerciseElement,
  createWorkoutComplexElement,
]);

export const createWorkoutSchema = z.object({
  title: z.string(),
  workoutCategory: z.string(),
  description: z.string().optional(),
  elements: z.array(createWorkoutElementSchema),
});

export type CreateWorkout = z.infer<typeof createWorkoutSchema>;

export const updateWorkoutSchema = createWorkoutSchema.partial();

export type UpdateWorkout = z.infer<typeof updateWorkoutSchema>;

const workoutExerciseElement = createWorkoutExerciseElement.extend({
  exercise: exerciseSchema,
});

const workoutComplexElement = createWorkoutComplexElement.extend({
  complex: complexSchema,
});

const workoutElementSchema = z.discriminatedUnion('type', [
  workoutExerciseElement,
  workoutComplexElement,
]);

export const workoutSchema = z.object({
  id: z.string(),
  title: z.string(),
  workoutCategory: z.string(),
  description: z.string().optional(),
  elements: z.array(workoutElementSchema),
});

export type WorkoutDto = z.infer<typeof workoutSchema>;
