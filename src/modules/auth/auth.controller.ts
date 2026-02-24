import {
  Body,
  Controller,
  Post,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthSignDto } from './dto/auth-sign.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/send-otp.dto';
import { ApiResponse, ApiSuccessResponse } from '../../common/response/api.response';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserResponseDto } from 'src/common/dto/user-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('request-otp')
  @ApiOperation({
    summary: 'Request OTP for signup or login or forgot password',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'OTP sent successfully',
    type: ApiSuccessResponse,
  })
  async requestOtp(@Body() sendOtpDto: SendOtpDto) : Promise<ApiResponse<null>> {
    return this.authService.requestOtp(
      sendOtpDto.email,
      sendOtpDto.type,
      sendOtpDto.userName,
    );
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'OTP verified successfully',
    type: ApiSuccessResponse,
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) : Promise<ApiResponse<null>> {
    return this.authService.verifyOtp(
      verifyOtpDto.email,
      verifyOtpDto.otp,
      verifyOtpDto.type,
    );
  }

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user (Requires verified OTP)' })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: ApiSuccessResponse,
  })
  async signup(
    @Body() authSignDto: AuthSignDto,
    @Res({ passthrough: true }) res: Response,
  ) : Promise<ApiResponse<{ access_token: string; user: UserResponseDto }>> {
    return this.authService.register(authSignDto, res);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user (Requires verified OTP)' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: ApiSuccessResponse,
  })
  async login(
    @Body() authLoginDto: AuthLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) : Promise<ApiResponse<{ access_token: string; user: UserResponseDto }>> {
    return this.authService.login(authLoginDto, res);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password (Requires verified OTP)' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully',
    type: ApiSuccessResponse,
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<ApiResponse<null>> {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @Post('logout')
  @ApiOperation({ summary: 'Logout a user' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Logout successful',
    type: ApiSuccessResponse,
  })
  logout(@Res({ passthrough: true }) res: Response):  ApiResponse<null>  {
    return this.authService.logout(res);
  }
}
