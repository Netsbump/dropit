import { z } from 'zod';
import { exerciseSchema } from './exercice.schema';

// Type pour représenter un exercice avec son ordre dans le complex
const complexExerciseSchema = z.object({
  exerciseId: z.string(),
  order: z.number().min(0),
});

export const createComplexSchema = z.object({
  name: z.string(),
  complexCategory: z.string(),
  exercises: z.array(complexExerciseSchema),
  description: z.string().optional(),
});

export type CreateComplex = z.infer<typeof createComplexSchema>;

export const complexSchema = z.object({
  id: z.string(),
  name: z.string(),
  complexCategory: z.object({
    id: z.string(),
    name: z.string(),
  }),
  exercises: z.array(exerciseSchema),
  description: z.string().optional(),
});

export type ComplexDto = z.infer<typeof complexSchema>;
