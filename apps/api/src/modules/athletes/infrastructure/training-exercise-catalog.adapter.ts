import { IExerciseCatalog as ITrainingExerciseCatalog } from '../../training/application/ports/exercise-catalog.port';
import { IExerciseCatalog } from '../application/ports/out/exercise-catalog.port';
import { PersonalRecordExercise } from '../domain/personal-record-exercise';
import type { OrganizationId } from '../../../shared/kernel/identity';

export class TrainingExerciseCatalogAdapter implements IExerciseCatalog {
  constructor(
    private readonly trainingExerciseCatalog: ITrainingExerciseCatalog
  ) {}

  async findExerciseByOrganization(
    exerciseId: string,
    organizationId: OrganizationId
  ): Promise<PersonalRecordExercise | null> {
    const exercise =
      await this.trainingExerciseCatalog.findExerciseByOrganization(
        exerciseId,
        organizationId
      );

    if (!exercise) {
      return null;
    }

    return PersonalRecordExercise.create(exercise.id, exercise.name);
  }
}
