import { z } from 'zod';

export const trainingParamsSchema = z.object({
  sets: z.number().min(1),
  reps: z.number().min(1),
  rest: z.number().optional(),
  duration: z.number().optional(),
  startWeight_percent: z.number().optional(),
  endWeight_percent: z.number().optional(),
});
