import { z } from 'zod';

export const createPersonalRecordSchema = z.object({
  weight: z.number().positive(),
  date: z
    .date()
    .optional()
    .default(() => new Date()),
  athleteId: z.string(),
  exerciseId: z.string(),
});

export type CreatePersonalRecord = z.infer<typeof createPersonalRecordSchema>;

export const updatePersonalRecordSchema = createPersonalRecordSchema
  .partial()
  .omit({
    athleteId: true,
    exerciseId: true,
  });

export type UpdatePersonalRecord = z.infer<typeof updatePersonalRecordSchema>;

export const personalRecordSchema = z.object({
  id: z.string(),
  weight: z.number(),
  date: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  athleteId: z.string(),
  exerciseId: z.string(),
  exerciseName: z.string().optional(),
});

export type PersonalRecordDto = z.infer<typeof personalRecordSchema>;

// Schema for summary of personal records shown in athlete profile
export const personalRecordsSummarySchema = z.object({
  snatch: z.number().optional(),
  cleanAndJerk: z.number().optional(),
  total: z.number().optional(),
});

export type PersonalRecordsSummary = z.infer<
  typeof personalRecordsSummarySchema
>;
