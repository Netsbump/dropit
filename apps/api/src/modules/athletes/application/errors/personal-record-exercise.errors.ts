import { NotFoundError } from '../../../../shared/application/errors/not-found.error';

export class PersonalRecordExerciseNotFoundError extends NotFoundError {
  constructor(exerciseId: string) {
    super(`Exercise with ID ${exerciseId} not found`);
  }
}
