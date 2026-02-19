import { Error, mongo } from 'mongoose';

export interface MongooseErrorDetail {
  message: string;
  kind: string;
  path?: string;
  value?: unknown;
}

export class MongooseExceptionExplainer {
  /**
   * Explains Mongoose specific errors in a human-readable way.
   * @param error The error object from Mongoose/MongoDB
   */
  static explain(error: Error | mongo.MongoServerError): MongooseErrorDetail {
    // 1. CastError (e.g. invalid ObjectId)
    if (error.name === 'CastError' && error instanceof Error.CastError) {
      return {
        kind: 'CAST_ERROR',
        message: `The value "${String(error.value)}" is not a valid ${String(error.kind)} for field "${String(error.path)}".`,
        path: error.path,
        value: error.value,
      };
    }

    // 2. ValidationError (Mongoose schema validation)
    if (
      error.name === 'ValidationError' &&
      error instanceof Error.ValidationError
    ) {
      const messages = Object.values(error.errors).map(
        (err: Error.ValidatorError | Error.CastError) => err.message,
      );
      return {
        kind: 'VALIDATION_ERROR',
        message: `Validation failed: ${messages.join(', ')}`,
      };
    }

    // 3. MongoServerError: Duplicate Key (Error code 11000)
    if (error instanceof mongo.MongoServerError && error.code === 11000) {
      const duplicateError = error as mongo.MongoServerError & {
        keyValue: Record<string, unknown>;
      };
      const field = Object.keys(duplicateError.keyValue)[0];
      const value = duplicateError.keyValue[field];
      return {
        kind: 'DUPLICATE_KEY_ERROR',
        message: `The value "${String(value)}" already exists for field "${String(field)}". Please use a unique value.`,
        path: field,
        value: value,
      };
    }

    // Default fallback
    return {
      kind: 'UNKNOWN_MONGOOSE_ERROR',
      message:
        (error as Error).message || 'An unexpected database error occurred.',
    };
  }
}
