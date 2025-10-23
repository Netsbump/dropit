import { z } from 'zod';

/**
 * Reusable schema for date filtering
 * Accepts ISO date strings in YYYY-MM-DD format
 */
export const dateFilterSchema = z.object({
  date: z.string().date().optional(),
});

/**
 * Reusable schema for date range filtering
 * Accepts ISO date strings in YYYY-MM-DD format
 */
export const dateRangeFilterSchema = z.object({
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});

export type DateFilter = z.infer<typeof dateFilterSchema>;
export type DateRangeFilter = z.infer<typeof dateRangeFilterSchema>;
