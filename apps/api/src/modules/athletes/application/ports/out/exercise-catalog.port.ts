import type { OrganizationId } from '../../../../../shared/kernel/identity';
import type { PersonalRecordExercise } from '../../../domain/personal-record-exercise';

export const ATHLETE_EXERCISE_CATALOG = Symbol('ATHLETE_EXERCISE_CATALOG');

export interface IExerciseCatalog {
  findExerciseByOrganization(
    exerciseId: string,
    organizationId: OrganizationId
  ): Promise<PersonalRecordExercise | null>;
}
