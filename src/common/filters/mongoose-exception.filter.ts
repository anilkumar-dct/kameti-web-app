import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Error, mongo } from 'mongoose';
import { MongooseExceptionExplainer } from '../utils/exception-explainer.util';
import { ApiResponse } from '../response/api.response';

/**
 * Catches Mongoose-related exceptions and returns a consistent ApiResponse.
 */
@Catch()
export class MongooseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Safely cast to access common error properties for detection without using 'any'
    const error = exception as Record<string, unknown>;

    // Check if it's a Mongoose or MongoDB error
    const isMongooseError = 
      error?.name === 'CastError' || 
      error?.name === 'ValidationError' || 
      error?.code === 11000;

    if (isMongooseError) {
      // The utility handles the specific Mongoose/Mongo types
      const detail = MongooseExceptionExplainer.explain(exception as Error | mongo.MongoServerError);
      
      // Return a consistent error response using the project's ApiResponse pattern
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponse.error(
          `Database Error: ${detail.kind}`, 
          detail.message
        ));
    }

    // For other errors, handle standard NestJS exceptions
    const status = (exception instanceof Object && 'getStatus' in exception && typeof (exception as { getStatus: Function }).getStatus === 'function') 
      ? (exception as { getStatus: Function }).getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseContent = error?.response as Record<string, unknown> | undefined;
    const message = responseContent?.message || error?.message || 'Internal Server Error';

    return response
      .status(status)
      .json(ApiResponse.error(
        'Server Error',
        Array.isArray(message) ? (message as string[]) : [String(message)]
      ));
  }
}
