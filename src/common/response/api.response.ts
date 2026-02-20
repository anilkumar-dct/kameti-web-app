import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ApiStatus } from '../enums/api-status.enum';

/**
 * Standard API response wrapper for all controllers.
 * @template T - The type of the data being returned.
 */
export class ApiResponse<T> {
  @ApiProperty({
    enum: ApiStatus,
    description: 'The status of the API request',
  })
  status: ApiStatus;

  @ApiProperty({
    description: 'A human-readable message describing the result',
  })
  message: string;

  @ApiProperty({ description: 'The HTTP status code' })
  statusCode: number;

  @ApiProperty({ required: false, description: 'The actual data payload' })
  data?: T;

  @ApiProperty({
    required: false,
    description: 'Error details if the request failed',
  })
  error?: string | string[];

  protected constructor(
    status: ApiStatus,
    message: string,
    statusCode: number,
    data?: T,
    error?: string | string[],
  ) {
    this.status = status;
    this.message = message;
    this.statusCode = statusCode;
    if (
      data !== undefined &&
      (status === ApiStatus.SUCCESS || status === ApiStatus.FAIL)
    ) {
      this.data = data;
    }
    if (error !== undefined && status === ApiStatus.ERROR) {
      this.error = error;
    }
  }

  /**
   * Creates a successful API response.
   */
  static success<T>(
    message: string,
    data: T,
    statusCode: number = HttpStatus.OK,
  ): ApiResponse<T> {
    return new ApiResponse<T>(ApiStatus.SUCCESS, message, statusCode, data);
  }

  /**
   * Creates an error API response for server-side issues.
   */
  static error<T>(
    message: string,
    error: string | string[],
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  ): ApiResponse<T> {
    return new ApiResponse<T>(
      ApiStatus.ERROR,
      message,
      statusCode,
      undefined,
      error,
    );
  }

  /**
   * Creates a failure API response for client-side issues or logical errors.
   */
  static fail<T>(
    message: string,
    error: string | string[],
    data?: T,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ): ApiResponse<T> {
    return new ApiResponse<T>(ApiStatus.FAIL, message, statusCode, data, error);
  }
}

/**
 * Specialized class for Swagger to show Success responses.
 */
export class ApiSuccessResponse<T> extends ApiResponse<T> {
  @ApiProperty({ enum: ApiStatus, example: ApiStatus.SUCCESS })
  declare status: ApiStatus;

  @ApiProperty({ example: 'Operation successful' })
  declare message: string;

  @ApiProperty({ example: 200 })
  declare statusCode: number;
}

/**
 * Specialized class for Swagger to show Error responses.
 */
export class ApiErrorResponse extends ApiResponse<null> {
  @ApiProperty({ enum: ApiStatus, example: ApiStatus.ERROR })
  declare status: ApiStatus;

  @ApiProperty({ example: 'An error occurred' })
  declare message: string;

  @ApiProperty({ example: 400 })
  declare statusCode: number;

  @ApiProperty({ example: ['Detailed error message 1', 'Detailed error message 2'] })
  declare error: string | string[];
}

