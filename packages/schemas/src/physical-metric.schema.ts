import { z } from 'zod';

const physicalMetricDateSchema = z
  .union([z.string(), z.date()])
  .pipe(z.coerce.date());

const physicalMetricValuesSchema = z.object({
  weight: z.number().positive().nullable().optional(),
  height: z.number().positive().nullable().optional(),
  date: physicalMetricDateSchema.optional(),
});

export const createPhysicalMetricSchema = physicalMetricValuesSchema
  .extend({
    date: physicalMetricDateSchema.optional().default(() => new Date()),
  })
  .refine((data) => data.weight != null || data.height != null, {
    message: 'At least one physical metric value is required',
    path: ['weight'],
  });

export type CreatePhysicalMetricInput = z.infer<
  typeof createPhysicalMetricSchema
>;

export const updatePhysicalMetricSchema = physicalMetricValuesSchema.refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field is required',
  }
);

export type UpdatePhysicalMetricInput = z.infer<
  typeof updatePhysicalMetricSchema
>;

export const physicalMetricSchema = z.object({
  id: z.string(),
  athleteId: z.string(),
  weight: z.number().nullable(),
  height: z.number().nullable(),
  date: z.date(),
});

export type PhysicalMetricDto = z.infer<typeof physicalMetricSchema>;
