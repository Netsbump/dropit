import { PersonalRecordDto, PersonalRecordsSummary } from '@dropit/schemas';
import { PersonalRecordException } from '../../application/exceptions/personal-record.exceptions';

export const PersonalRecordPresenter = {

  present(personalRecords: PersonalRecordDto[]) {
    return {
      status: 200 as const,
      body: personalRecords,
    };
  },

  presentOne(personalRecord: PersonalRecordDto) {
    return {
      status: 200 as const,
      body: personalRecord,
    };
  },

  presentSummary(summary: PersonalRecordsSummary) {
    return {
      status: 200 as const,
      body: summary,
    };
  },

  presentCreated(personalRecord: PersonalRecordDto) {
    return {
      status: 201 as const,
      body: personalRecord,
    };
  },

  presentDeleted() {
    return {
      status: 204 as const,
      body: null,
    };
  },

  presentSuccess(message: string) {
    return {
      status: 200 as const,
      body: { message },
    };
  },

  presentError(error: Error) {
    if (error instanceof PersonalRecordException) {
      return {
        status: error.statusCode as 400 | 403 | 404 | 500,
        body: { message: error.message }
      };
    }

    console.error('PersonalRecord unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
}; 