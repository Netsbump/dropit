import { z } from 'zod';
import { complexSchema } from './complex.schema';
import { exerciseSchema } from './exercice.schema';

export const WORKOUT_ELEMENT_TYPES = {
  EXERCISE: 'exercise',
  COMPLEX: 'complex',
} as const;

export type WorkoutElementType =
  (typeof WORKOUT_ELEMENT_TYPES)[keyof typeof WORKOUT_ELEMENT_TYPES];

// Block configuration schemas
export const exerciseConfigSchema = z.object({
  exerciseId: z.string().uuid(),
  reps: z.number().int().positive(),
  order: z.number().int().positive()
})

export type ExerciseConfigDto = z.infer<typeof exerciseConfigSchema>;

export const intensityConfigSchema = z.object({
  percentageOfMax: z.number().min(0).max(200).optional(),
  referenceExerciseId: z.string().uuid().optional(),
  type: z.enum(['percentage', 'rpe']).optional()
})

export type IntensityConfigDto = z.infer<typeof intensityConfigSchema>;

export const blockConfigSchema = z.object({
  order: z.number().int().positive(),
  numberOfSets: z.number().int().positive(),
  rest: z.number().int().positive().optional(),
  intensity: intensityConfigSchema.optional(),
  exercises: z.array(exerciseConfigSchema).min(1)
})

export type BlockConfigDto = z.infer<typeof blockConfigSchema>;

// Workout element schemas
const createWorkoutExerciseElement = z.object({
  type: z.literal('exercise'),
  exerciseId: z.string().uuid(),
  order: z.number().min(0),
  tempo: z.string().optional(),
  commentary: z.string().optional(),
  blocks: z.array(blockConfigSchema),
});

const createWorkoutComplexElement = z.object({
  type: z.literal('complex'),
  complexId: z.string().uuid(),
  order: z.number().min(0),
  tempo: z.string().optional(),
  commentary: z.string().optional(),
  blocks: z.array(blockConfigSchema),
});

const createWorkoutElementSchema = z.discriminatedUnion('type', [
  createWorkoutExerciseElement,
  createWorkoutComplexElement,
]);

// Schéma pour la création d'une session en même temps qu'un workout
const createTrainingSessionWithWorkoutSchema = z.object({
  athleteIds: z.array(z.string()),
  scheduledDate: z.string().or(z.date()),
});

export const createWorkoutSchema = z.object({
  workoutCategory: z.string(),
  description: z.string().optional(),
  elements: z.array(createWorkoutElementSchema),
  trainingSession: createTrainingSessionWithWorkoutSchema.optional(),
});

export type CreateWorkout = z.infer<typeof createWorkoutSchema>;

export const updateWorkoutSchema = createWorkoutSchema.partial();

export type UpdateWorkout = z.infer<typeof updateWorkoutSchema>;

const workoutExerciseElement = z.object({
  id: z.string(),
  type: z.literal('exercise'),
  order: z.number(),
  tempo: z.string().optional(),
  commentary: z.string().optional(),
  blocks: z.array(blockConfigSchema),
  exercise: exerciseSchema,
});

const workoutComplexElement = z.object({
  id: z.string(),
  type: z.literal('complex'),
  order: z.number(),
  tempo: z.string().optional(),
  commentary: z.string().optional(),
  blocks: z.array(blockConfigSchema),
  complex: complexSchema,
});

const workoutElementSchema = z.discriminatedUnion('type', [
  workoutExerciseElement,
  workoutComplexElement,
]);

export const workoutSchema = z.object({
  id: z.string(),
  workoutCategory: z.string(),
  description: z.string().optional(),
  elements: z.array(workoutElementSchema),
});

export type WorkoutDto = z.infer<typeof workoutSchema>;
