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
import { OtpService } from './services/otp.service';
import { MailService } from './services/mail.service';
import { OtpType } from './enums/otp-type';
import { ApiStatus } from 'src/common/enums/api-status.enum';

/**
 * Service to handle user authentication, registration, and password management.
 */
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private authTokenGenerateService: AuthTokenGenerateService,
    private configService: ConfigService,
    private otpService: OtpService,
    private mailService: MailService,
  ) {}

  /**
   * Generates and sends an OTP based on the requested type (SIGNUP/LOGIN).
   */
  async requestOtp(
    email: string,
    type: OtpType,
    userName?: string,
  ): Promise<ApiResponse<null>> {
    if (type === OtpType.SIGNUP) {
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser.data) {
        return ApiResponse.error(
          'User already exists',
          'User already exists',
          HttpStatus.CONFLICT,
        );
      }
    } else if (type === OtpType.LOGIN || type === OtpType.FORGOT_PASSWORD) {
      const userResponse = await this.userService.findByEmail(email);
      if (!userResponse.data) {
        return ApiResponse.error(
          'User not found',
          'User with this email does not exist',
          HttpStatus.NOT_FOUND,
        );
      }
    }

    const otp = await this.otpService.generateOtp(email, type);

    let subject: string;
    let message: string;

    switch (type) {
      case OtpType.SIGNUP:
        subject = 'Signup Verification OTP';
        message = `Welcome ${userName || email}! Your verification code for signing up is`;
        break;
      case OtpType.LOGIN:
        subject = 'Login Verification OTP';
        message = 'Your verification code for logging in is';
        break;
      case OtpType.FORGOT_PASSWORD:
        subject = 'Password Reset OTP';
        message = 'Your verification code for resetting your password is';
        break;
      default:
        subject = 'Verification OTP';
        message = 'Your verification code is';
    }

    await this.mailService.sendOtp(email, otp, subject, message);

    return ApiResponse.success('OTP sent to your email', null);
  }

  /**
   * Verifies an OTP for a specific type.
   */
  async verifyOtp(
    email: string,
    otp: string,
    type: OtpType,
  ): Promise<ApiResponse<null>> {
    await this.otpService.verifyOtp(email, otp, type);
    return ApiResponse.success('OTP verified successfully', null);
  }

  /**
   * Registers a new user only if OTP is verified.
   */
  async register(
    authSignDto: AuthSignDto,
    res: Response,
  ): Promise<ApiResponse<{ access_token: string; user: UserResponseDto }>> {
    // Consume OTP first to ensure verification
    await this.otpService.consumeOtp(authSignDto.email, OtpType.SIGNUP);

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
      const result = user.data.toObject() as unknown as Record<string, any>;
      delete result.password;
      return plainToInstance(UserResponseDto, result);
    }
    return null;
  }

  /**
   * Authenticates a user only if OTP is verified.
   */
  async login(
    authLoginDto: AuthLoginDto,
    res: Response,
  ): Promise<ApiResponse<{ access_token: string; user: UserResponseDto }>> {
    // Consume OTP first to ensure verification
    await this.otpService.consumeOtp(authLoginDto.email, OtpType.LOGIN);

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

  async resetPassword(
    email: string,
    newPassword: string,
  ): Promise<ApiResponse<null>> {
    await this.otpService.consumeOtp(email, OtpType.FORGOT_PASSWORD);

    const updateResponse = await this.userService.update(email, {
      password: newPassword,
    });

    if (updateResponse.status !== ApiStatus.SUCCESS) {
      return ApiResponse.error(
        'Failed to reset password',
        updateResponse.message,
      );
    }

    return ApiResponse.success('Password reset successfully', null);
  }
}
