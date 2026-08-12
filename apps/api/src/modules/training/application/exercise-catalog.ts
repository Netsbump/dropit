import { IMemberUseCases } from '../../auth/application/ports/member-use-cases.port';
import { Exercise } from '../domain/exercise.entity';
import { IExerciseCatalog } from './ports/exercise-catalog.port';
import { IExerciseRepository } from './ports/exercise.repository.port';

export class ExerciseCatalog implements IExerciseCatalog {
  constructor(
    private readonly exerciseRepository: IExerciseRepository,
    private readonly memberUseCases: IMemberUseCases
  ) {}

  async findExerciseByOrganization(
    exerciseId: string,
    organizationId: string
  ): Promise<Exercise | null> {
    const coachFilterConditions =
      await this.memberUseCases.getCoachFilterConditions(organizationId);

    return await this.exerciseRepository.getOne(
      exerciseId,
      coachFilterConditions
    );
  }
}
