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

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const paginationMetadataSchema = z.object({
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
  total: z.number().int().min(0),
  hasNext: z.boolean(),
});

export type DateFilterInput = z.infer<typeof dateFilterSchema>;
export type DateRangeFilterInput = z.infer<typeof dateRangeFilterSchema>;
export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
export type PaginationMetadataDto = z.infer<typeof paginationMetadataSchema>;
