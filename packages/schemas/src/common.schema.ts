import { z } from 'zod';

/**
 * Reusable schema for date filtering
 * Accepts ISO date strings in YYYY-MM-DD format
 */
export const dateFilterSchema = z.object({
  date: z.string().date().optional(),
});

export type DateFilter = z.infer<typeof dateFilterSchema>;
