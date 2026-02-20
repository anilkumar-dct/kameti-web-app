import { Body, Controller, Post, Res, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthSignDto } from './dto/auth-sign.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/send-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/response/api.response';

/**
 * Controller for handling authentication-related requests.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint for user registration.
   */
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: ApiSuccessResponse,
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists',
    type: ApiErrorResponse,
  })
  async signup(
    @Body() authSignDto: AuthSignDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(authSignDto, res);
  }

  /**
   * Endpoint for user login.
   */
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: ApiSuccessResponse,
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
    type: ApiErrorResponse,
  })
  async login(
    @Body() authLoginDto: AuthLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(authLoginDto, res);
  }

  /**
   * Endpoint to send an OTP (Admin only).
   */
  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP for password reset (Admin only)' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'OTP sent successfully',
    type: ApiSuccessResponse,
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Action not allowed (Non-admin)',
    type: ApiErrorResponse,
  })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto.email);
  }

  /**
   * Endpoint to verify an OTP.
   */
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'OTP verified',
    type: ApiSuccessResponse,
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid OTP',
    type: ApiErrorResponse,
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  /**
   * Endpoint to reset password after OTP verification.
   */
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successful',
    type: ApiSuccessResponse,
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Verification missing or failed',
    type: ApiErrorResponse,
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.newPassword,
    );
  }
}
