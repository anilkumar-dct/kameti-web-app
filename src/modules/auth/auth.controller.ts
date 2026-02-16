import { Body, Controller, Post, UseGuards, Get, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthSignDto } from './dto/auth-sign.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AdminAuthGuard } from './admin-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    async signup(@Body() authSignDto: AuthSignDto, @Res({ passthrough: true }) res: Response) {
        console.log(authSignDto);
        return this.authService.register(authSignDto, res);
    }

    @Post('login')
    async login(@Body() authLoginDto: AuthLoginDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.login(authLoginDto, res);
    }

}
