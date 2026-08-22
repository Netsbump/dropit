import type { OrganizationId } from '../../../../../shared/kernel/identity';

export const ATHLETE_EXERCISE_CATALOG = Symbol('ATHLETE_EXERCISE_CATALOG');

export type AvailableExercise = {
  id: string;
  name: string;
};

export interface IExerciseCatalog {
  findExerciseByOrganization(
    exerciseId: string,
    organizationId: OrganizationId
  ): Promise<AvailableExercise | null>;
}
