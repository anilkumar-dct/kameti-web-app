import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ApiStatus } from '../enums/api-status.enum';

export class ApiResponse<T> {
  @ApiProperty({ enum: ApiStatus, description: 'Status of the API response' })
  status: ApiStatus;

  @ApiProperty({ description: 'Human-readable message' })
  message: string;

  @ApiProperty({ description: 'Data returned by the API', required: false })
  data?: T;

  @ApiProperty({ description: 'Error details', required: false })
  error?: string | string[];

  @ApiProperty({ description: 'HTTP status code' })
  statusCode: number;

  constructor(
    status: ApiStatus,
    message: string,
    statusCode: number = 200,
    data?: T,
    error?: string | string[],
  ) {
    this.status = status;
    this.message = message;
    this.statusCode = statusCode;
    if (data !== undefined) {
      this.data = data;
    }
    if (error !== undefined) {
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

  @ApiProperty({
    example: ['Detailed error message 1', 'Detailed error message 2'],
  })
  declare error: string | string[];
}
