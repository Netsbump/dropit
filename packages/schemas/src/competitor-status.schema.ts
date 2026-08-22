import { z } from 'zod';

export enum CompetitorLevel {
  ROOKIE = 'rookie',
  REGIONAL = 'regional',
  NATIONAL = 'national',
  INTERNATIONAL = 'international',
  ELITE = 'elite',
}

export enum SexCategory {
  MEN = 'men',
  WOMEN = 'women',
}

export const createCompetitorStatusSchema = z.object({
  level: z.nativeEnum(CompetitorLevel),
  sexCategory: z.nativeEnum(SexCategory),
  weightCategory: z.number(),
});

export type CreateCompetitorStatusInput = z.infer<
  typeof createCompetitorStatusSchema
>;

export const updateCompetitorStatusSchema =
  createCompetitorStatusSchema.partial();

export type UpdateCompetitorStatusInput = z.infer<
  typeof updateCompetitorStatusSchema
>;

export const competitorStatusSchema = z.object({
  id: z.string(),
  level: z.string(),
  sexCategory: z.string(),
  weightCategory: z.number(),
  endDate: z.string().nullable(),
});

export type CompetitorStatusDto = z.infer<typeof competitorStatusSchema>;
