import { z } from 'zod';

export const createComplexCategorySchema = z.object({
  name: z.string(),
});

export type CreateComplexCategoryInput = z.infer<typeof createComplexCategorySchema>;

export const updateComplexCategorySchema = createComplexCategorySchema;

export type UpdateComplexCategoryInput = z.infer<typeof updateComplexCategorySchema>;

export const complexCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type ComplexCategoryDto = z.infer<typeof complexCategorySchema>;
