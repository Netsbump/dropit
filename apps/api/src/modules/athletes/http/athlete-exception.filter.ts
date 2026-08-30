import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { AccessDeniedError } from '../../../shared/application/errors/access-denied.error';
import { ConflictError } from '../../../shared/application/errors/conflict.error';
import { NotFoundError } from '../../../shared/application/errors/not-found.error';
import { InvalidUuidError } from 'src/shared/kernel';
import { AthleteDomainError } from '../domain/athlete';
import { CompetitorStatusDomainError } from '../domain/competitor-status';
import { PersonalRecordDomainError } from '../domain/personal-record';
import { PhysicalMetricDomainError } from '../domain/physical-metric';

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
  if (error instanceof InvalidUuidError) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: error.message,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      statusCode: HttpStatus.NOT_FOUND,
      message: error.message,
    };
  }

  if (error instanceof ConflictError) {
    return {
      statusCode: HttpStatus.CONFLICT,
      message: error.message,
    };
  }

  if (error instanceof AccessDeniedError) {
    return {
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Access denied',
    };
  }

  if (
    error instanceof AthleteDomainError ||
    error instanceof CompetitorStatusDomainError ||
    error instanceof PersonalRecordDomainError ||
    error instanceof PhysicalMetricDomainError
  ) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
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

    if (exception instanceof AccessDeniedError) {
      this.logger.warn(exception.message);
    }

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
