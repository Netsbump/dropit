import { Exercise } from '../../domain/exercise.entity';

export const EXERCISE_CATALOG = Symbol('EXERCISE_CATALOG');

export interface IExerciseCatalog {
  findExerciseByOrganization(
    exerciseId: string,
    organizationId: string
  ): Promise<Exercise | null>;
}
