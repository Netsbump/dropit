import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { AthleteApplicationError } from '../application/errors/athlete.errors';
import { InvalidAthleteIdError } from '../domain/athlete-id';
import { InvalidCompetitorStatusIdError } from '../domain/competitor-status-id';
import { InvalidPersonalRecordIdError } from '../domain/personal-record-id';
import { InvalidOrganizationIdError } from '../../../shared/kernel/identity';
import { CompetitorStatusException } from '../application/errors/competitor-status.exceptions';
import { PersonalRecordException } from '../application/errors/personal-record.exceptions';

type HttpErrorResponse = {
  statusCode: number;
  message: string;
};

const getHttpExceptionMessage = (exception: HttpException): string => {
  const response = exception.getResponse();

  if (typeof response === 'string') {
    return response;
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'message' in response
  ) {
    const message = response.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }
  }

  return exception.message;
};

const toHttpErrorResponse = (error: unknown): HttpErrorResponse => {
  if (
    error instanceof InvalidAthleteIdError ||
    error instanceof InvalidCompetitorStatusIdError ||
    error instanceof InvalidPersonalRecordIdError ||
    error instanceof InvalidOrganizationIdError
  ) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: error.message,
    };
  }

  if (
    error instanceof AthleteApplicationError ||
    error instanceof CompetitorStatusException ||
    error instanceof PersonalRecordException
  ) {
    return {
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  if (error instanceof HttpException) {
    return {
      statusCode: error.getStatus(),
      message: getHttpExceptionMessage(error),
    };
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'An error occurred while processing the request',
  };
};

@Catch()
export class AthleteExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AthleteExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const errorResponse = toHttpErrorResponse(exception);

    if (errorResponse.statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception)
      );
    }

    response.status(errorResponse.statusCode).json({
      message: errorResponse.message,
    });
  }
}
