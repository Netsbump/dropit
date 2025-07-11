import { PersonalRecordDto, PersonalRecordsSummary } from '@dropit/schemas';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

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

  presentCreationError(error: Error) {
    if (error instanceof BadRequestException) {
      return { status: 400 as const, body: { message: error.message } };
    }

    if (error instanceof ForbiddenException) {
      return { status: 403 as const, body: { message: error.message } };
    }

    if (error instanceof NotFoundException) {
      return { status: 404 as const, body: { message: error.message } };
    }
    
    console.error('PersonalRecord error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  },

  presentError(error: Error) {
    if (error instanceof NotFoundException) {
      return { status: 404 as const, body: { message: error.message } };
    }
    
    console.error('PersonalRecord error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
}; 