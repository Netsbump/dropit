export const ATHLETE_EXERCISE_CATALOG = Symbol('ATHLETE_EXERCISE_CATALOG');

export type AvailableExercise = {
  id: string;
  name: string;
};

export interface IExerciseCatalog {
  findExerciseByOrganization(
    exerciseId: string,
    organizationId: string
  ): Promise<AvailableExercise | null>;
}
