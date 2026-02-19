import { ApiStatus } from '../enums/api-status.enum';

export class ApiResponse<T> {
  status: ApiStatus;
  message: string;
  data?: T;
  error?: string | string[];

  private constructor(
    status: ApiStatus,
    message: string,
    data?: T,
    error?: string | string[],
  ) {
    this.status = status;
    this.message = message;
    if (data && (status === ApiStatus.SUCCESS || status === ApiStatus.FAIL)) {
      this.data = data;
    }
    if (error && status === ApiStatus.ERROR) {
      this.error = error;
    }
  }

  static success<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse<T>(ApiStatus.SUCCESS, message, data);
  }

  static error<T>(message: string, error: string | string[]): ApiResponse<T> {
    return new ApiResponse<T>(ApiStatus.ERROR, message, undefined, error);
  }

  static fail<T>(
    message: string,
    error: string | string[],
    data?: T,
  ): ApiResponse<T> {
    return new ApiResponse<T>(ApiStatus.FAIL, message, data, error);
  }
}
