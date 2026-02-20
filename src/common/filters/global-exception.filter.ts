import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Error as MongooseError, mongo } from 'mongoose';
import { ApiResponse } from '../response/api.response';
import { MongooseExceptionExplainer } from '../utils/exception-explainer.util';

/**
 * Global exception filter to handle all exceptions and return a standardized
 * human-readable response.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: string | string[] = 'An unexpected error occurred';

    // Check if it's a Mongoose or MongoDB error
    const isMongooseError =
      exception instanceof MongooseError ||
      (exception as Record<string, unknown>)?.name === 'CastError' ||
      (exception as Record<string, unknown>)?.name === 'ValidationError' ||
      (exception as Record<string, unknown>)?.code === 11000;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = exception.name;

      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        error =
          (resObj.message as string | string[]) ||
          (resObj.error as string) ||
          message;
      } else {
        error = res as string;
      }
    } else if (isMongooseError) {
      // Database specific error handling via specialized explainer
      const detail = MongooseExceptionExplainer.explain(
        exception as MongooseError | mongo.MongoServerError,
      );
      status = HttpStatus.BAD_REQUEST;
      if (detail.kind === 'DUPLICATE_KEY_ERROR') {
        status = HttpStatus.CONFLICT;
      }
      message = `Database Error: ${detail.kind}`;
      error = detail.message;
    } else if (exception instanceof Error) {
      // Generic Error handling
      message = exception.name;
      error = exception.message;
    }

    this.logger.error(
      `Exception caught: ${message} - ${JSON.stringify(error)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const apiResponse = ApiResponse.error(message, error, status);
    response.status(status).json(apiResponse);
  }
}
