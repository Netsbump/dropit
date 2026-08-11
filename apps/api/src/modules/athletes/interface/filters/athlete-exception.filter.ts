import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { AthleteApplicationError } from '../../application/errors/athlete.errors';

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

const toHttpErrorResponse = (exception: unknown): HttpErrorResponse => {
  if (exception instanceof AthleteApplicationError) {
    return {
      statusCode: exception.statusCode,
      message: exception.message,
    };
  }

  if (exception instanceof HttpException) {
    return {
      statusCode: exception.getStatus(),
      message: getHttpExceptionMessage(exception),
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
