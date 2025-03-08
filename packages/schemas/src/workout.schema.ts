import { z } from 'zod';
import { complexSchema } from './complex.schema';
import { exerciseSchema } from './exercice.schema';

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
  sets: z.number().min(1),
  reps: z.number().min(1),
  rest: z.number().optional(),
  duration: z.number().optional(),
  startWeight_percent: z.number().optional(),
  endWeight_percent: z.number().optional(),
});

const createWorkoutComplexElement = z.object({
  type: z.literal('complex'),
  id: z.string(),
  order: z.number().min(0),
  sets: z.number().min(1),
  reps: z.number().min(1),
  rest: z.number().optional(),
  duration: z.number().optional(),
  startWeight_percent: z.number().optional(),
  endWeight_percent: z.number().optional(),
});

const createWorkoutElementSchema = z.discriminatedUnion('type', [
  createWorkoutExerciseElement,
  createWorkoutComplexElement,
]);

// Schéma pour la création d'une session en même temps qu'un workout
const createSessionWithWorkoutSchema = z.object({
  athleteIds: z.array(z.string()),
  scheduledDate: z.string().or(z.date()),
});

export const createWorkoutSchema = z.object({
  title: z.string(),
  workoutCategory: z.string(),
  description: z.string().optional(),
  elements: z.array(createWorkoutElementSchema),
  session: createSessionWithWorkoutSchema.optional(),
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
