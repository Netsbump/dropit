import { IExerciseCatalog as ITrainingExerciseCatalog } from '../../training/application/ports/exercise-catalog.port';
import {
  AvailableExercise,
  IExerciseCatalog,
} from '../application/ports/exercise-catalog.port';

export class TrainingExerciseCatalogAdapter implements IExerciseCatalog {
  constructor(
    private readonly trainingExerciseCatalog: ITrainingExerciseCatalog
  ) {}

  async findExerciseByOrganization(
    exerciseId: string,
    organizationId: string
  ): Promise<AvailableExercise | null> {
    const exercise =
      await this.trainingExerciseCatalog.findExerciseByOrganization(
        exerciseId,
        organizationId
      );

    if (!exercise) {
      return null;
    }

    return {
      id: exercise.id,
      name: exercise.name,
    };
  }
}
