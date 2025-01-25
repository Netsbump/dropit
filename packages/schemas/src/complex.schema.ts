import { z } from 'zod';
import { exerciseSchema } from './exercice.schema';
import { trainingParamsSchema } from './training-params.schema';

const complexExerciseSchema = z.object({
  exerciseId: z.string(),
  order: z.number().min(0),
  trainingParams: trainingParamsSchema,
});

export const createComplexSchema = z.object({
  name: z.string(),
  complexCategory: z.string(),
  exercises: z.array(complexExerciseSchema),
  description: z.string().optional(),
});

export type CreateComplex = z.infer<typeof createComplexSchema>;

export const updateComplexSchema = z.object({
  name: z.string().optional(),
  complexCategory: z.string().optional(),
  exercises: z.array(complexExerciseSchema).optional(),
  description: z.string().optional(),
});

export type UpdateComplex = z.infer<typeof updateComplexSchema>;

const exerciseWithParamsSchema = exerciseSchema.extend({
  order: z.number(),
  trainingParams: trainingParamsSchema,
});

export const complexSchema = z.object({
  id: z.string(),
  name: z.string(),
  complexCategory: z.object({
    id: z.string(),
    name: z.string(),
  }),
  exercises: z.array(exerciseWithParamsSchema),
  description: z.string().optional(),
});

export type ComplexDto = z.infer<typeof complexSchema>;
