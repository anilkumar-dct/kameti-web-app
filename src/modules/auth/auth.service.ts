import { Injectable, HttpStatus } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { AuthSignDto } from './dto/auth-sign.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from 'src/common/dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { ApiResponse } from 'src/common/response/api.response';
import { AuthTokenGenerateService } from './jwt/auth-token-generate.service';
import { Response } from 'express';
import { ConfigService } from 'src/config/config.service';
import { UserRole } from 'src/common/enums/user-role.enum';
import { OtpService } from './services/otp.service';
import { MailService } from './services/mail.service';
import { ApiStatus } from 'src/common/enums/api-status.enum';

/**
 * Service to handle user authentication, registration, and password management.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly authTokenGenerateService: AuthTokenGenerateService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Registers a new user and returns an access token.
   * @param authSignDto - Registration details
   * @param res - Express response object for setting cookies
   * @returns Successful ApiResponse with token and user details
   */
  async register(
    authSignDto: AuthSignDto,
    res: Response,
  ): Promise<ApiResponse<{ access_token: string; user: UserResponseDto }>> {
    const existingUser = await this.userService.findByEmail(authSignDto.email);
    if (existingUser.data) {
      return ApiResponse.error(
        'User already exists',
        'User already exists',
        HttpStatus.CONFLICT,
      );
    }

    const user = await this.userService.createUser(authSignDto);
    if (!user || !user.data) {
      return ApiResponse.error(
        'User not created',
        'User creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const accessToken = this.authTokenGenerateService.generateToken(user.data);
    this.authTokenGenerateService.storeValueInCookie(
      res,
      this.configService.cookieName,
      accessToken,
    );

    return ApiResponse.success(
      'User created successfully',
      {
        access_token: accessToken,
        user: user.data,
      },
      HttpStatus.CREATED,
    );
  }

  /**
   * Validates user credentials.
   * @private
   */
  private async validateUser(
    email: string,
    pass: string,
  ): Promise<UserResponseDto | null> {
    const user = await this.userService.findByEmail(email);
    if (user.data && (await bcrypt.compare(pass, user.data.password))) {
      const result = user.data.toObject() as unknown as Record<string, unknown>;
      delete result.password;
      return plainToInstance(UserResponseDto, result);
    }
    return null;
  }

  /**
   * Authenticates a user and returns an access token.
   * @param authLoginDto - Login credentials
   * @param res - Express response object
   * @returns Successful ApiResponse with token and user details
   */
  async login(
    authLoginDto: AuthLoginDto,
    res: Response,
  ): Promise<ApiResponse<{ access_token: string; user: UserResponseDto }>> {
    const user = await this.validateUser(
      authLoginDto.email,
      authLoginDto.password,
    );

    if (!user) {
      return ApiResponse.error(
        'Invalid credentials',
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const accessToken = this.authTokenGenerateService.generateToken(user);
    this.authTokenGenerateService.storeValueInCookie(
      res,
      this.configService.cookieName,
      accessToken,
    );

    return ApiResponse.success('Login successful', {
      access_token: accessToken,
      user: user,
    });
  }

  /**
   * Generates and sends an OTP for password reset (Admin only).
   * @param email - User's email
   * @returns ApiResponse with success message
   */
  async sendOtp(email: string): Promise<ApiResponse<null>> {
    const userResponse = await this.userService.findByEmail(email);
    if (!userResponse.data) {
      return ApiResponse.error(
        'User not found',
        'User with this email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const user = userResponse.data;
    if (user.role !== UserRole.ADMIN) {
      return ApiResponse.error(
        'Action not allowed',
        'Use Desktop application to reset the password',
        HttpStatus.FORBIDDEN,
      );
    }

    const otp = await this.otpService.generateOtp(email);
    await this.mailService.sendOtp(email, otp);

    return ApiResponse.success('OTP sent to your email', null);
  }

  /**
   * Verifies the provided OTP for a user.
   * @param email - User's email
   * @param otp - The OTP code
   * @returns ApiResponse with success message
   */
  async verifyOtp(email: string, otp: string): Promise<ApiResponse<null>> {
    await this.otpService.verifyOtp(email, otp);
    return ApiResponse.success('OTP verified successfully', null);
  }

  /**
   * Resets the user's password using a previously verified OTP.
   * @param email - User's email
   * @param newPassword - The new password
   * @returns ApiResponse with success message
   */
  async resetPassword(
    email: string,
    newPassword: string,
  ): Promise<ApiResponse<null>> {
    await this.otpService.consumeOtp(email);

    const updateResponse = await this.userService.update(email, {
      password: newPassword,
    });

    if (updateResponse.status !== ApiStatus.SUCCESS) {
      return ApiResponse.error(
        'Failed to reset password',
        updateResponse.message,
        updateResponse.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return ApiResponse.success('Password reset successfully', null);
  }
}
