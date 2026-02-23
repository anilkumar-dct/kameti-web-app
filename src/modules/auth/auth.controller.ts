import { Body, Controller, Post, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthSignDto } from './dto/auth-sign.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/send-otp.dto';
import { ApiSuccessResponse, ApiErrorResponse } from '../../common/response/api.response';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('request-otp')
    @ApiOperation({ summary: 'Request OTP for signup or login' })
    @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OTP sent successfully', type: ApiSuccessResponse })
    async requestOtp(@Body() sendOtpDto: SendOtpDto) {
        return this.authService.requestOtp(sendOtpDto.email, sendOtpDto.type, sendOtpDto.userName);
    }

    @Post('verify-otp')
    @ApiOperation({ summary: 'Verify OTP' })
    @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OTP verified successfully', type: ApiSuccessResponse })
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
        return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp, verifyOtpDto.type);
    }

    @Post('signup')
    @ApiOperation({ summary: 'Register a new user (Requires verified OTP)' })
    @SwaggerApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully', type: ApiSuccessResponse })
    async signup(@Body() authSignDto: AuthSignDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.register(authSignDto, res);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login a user (Requires verified OTP)' })
    @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Login successful', type: ApiSuccessResponse })
    async login(@Body() authLoginDto: AuthLoginDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.login(authLoginDto, res);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password (Requires verified OTP)' })
    @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Password reset successfully', type: ApiSuccessResponse })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(
        resetPasswordDto.email,
        resetPasswordDto.newPassword,
        );
    }
}
