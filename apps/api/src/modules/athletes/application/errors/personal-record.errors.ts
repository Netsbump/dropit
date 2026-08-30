import { NotFoundError } from '../../../../shared/application/errors/not-found.error';
import type { PersonalRecordId } from '../../domain/personal-record-id';

export class PersonalRecordNotFoundError extends NotFoundError {
  constructor(personalRecordId: PersonalRecordId) {
    super(`Personal record with ID ${personalRecordId} not found`);
  }
}
