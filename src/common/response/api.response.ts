import { ApiStatus } from "../enums/api-status.enum";
import { ApiProperty } from "@nestjs/swagger";

export class ApiResponse<T> {
  @ApiProperty({ enum: ApiStatus, description: "Status of the API response" })
  status: ApiStatus;

  @ApiProperty({ description: "Human-readable message" })
  message: string;

  @ApiProperty({ description: "Data returned by the API", required: false })
  data?: T;

  @ApiProperty({ description: "Error details", required: false })
  error?: string | string[];

  @ApiProperty({ description: "HTTP status code" })
  statusCode: number;

  constructor(
    status: ApiStatus,
    message: string,
    data?: T,
    error?: string | string[],
    statusCode: number = 200
  ) {
    this.status = status;
    this.message = message;
    this.statusCode = statusCode;
    if (data !== undefined && status === ApiStatus.SUCCESS) {
      this.data = data;
    }
    if (error !== undefined && status === ApiStatus.ERROR) {
      this.error = error;
    }
  }

  static success<T>(
    message: string,
    data: T,
    statusCode: number = 200
  ): ApiResponse<T> {
    return new ApiResponse<T>(ApiStatus.SUCCESS, message, data, undefined, statusCode);
  }

  static error<T>(
    message: string,
    error: string | string[],
    statusCode: number = 400
  ): ApiResponse<T> {
    return new ApiResponse<T>(ApiStatus.ERROR, message, undefined, error, statusCode);
  }
}

export class ApiSuccessResponse extends ApiResponse<any> {}
export class ApiErrorResponse extends ApiResponse<null> {}