import { z } from 'zod';
import { exerciseSchema } from './exercice.schema';

const createExerciseComplexSchema = z.object({
  exerciseId: z.string(),
  order: z.number().min(0),
});

export const createComplexSchema = z.object({
  complexCategory: z.string(),
  exercises: z.array(createExerciseComplexSchema),
});

export type CreateComplex = z.infer<typeof createComplexSchema>;

export const updateComplexSchema = z.object({
  complexCategory: z.string().optional(),
  exercises: z.array(createExerciseComplexSchema).optional(),
});

export type UpdateComplex = z.infer<typeof updateComplexSchema>;

const exerciseComplexSchema = exerciseSchema.extend({
  order: z.number(),
});

export const complexSchema = z.object({
  id: z.string(),
  complexCategory: z.object({
    id: z.string(),
    name: z.string(),
  }),
  exercises: z.array(exerciseComplexSchema),
});

export type ComplexDto = z.infer<typeof complexSchema>;
