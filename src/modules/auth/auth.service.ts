import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private authTokenGenerateService: AuthTokenGenerateService,
    private configService: ConfigService,
  ) {}

  async register(
    authSignDto: AuthSignDto,
    res: Response,
  ): Promise<ApiResponse<{ access_token: string; user: UserResponseDto }>> {
    const existingUser = await this.userService.findByEmail(authSignDto.email);
    if (existingUser.data) {
      return ApiResponse.error('User already exists', 'User already exists');
    }
    const user = await this.userService.createUser(authSignDto);
    if (!user || !user.data) {
      return ApiResponse.error('User not created', 'User not created');
    }

    const accessToken = this.authTokenGenerateService.generateToken(user.data);
    this.authTokenGenerateService.storeValueInCookie(
      res,
      this.configService.cookieName,
      accessToken,
    );

    return ApiResponse.success('User created successfully', {
      access_token: accessToken,
      user: user.data,
    });
  }

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

  async login(
    authLoginDto: AuthLoginDto,
    res: Response,
  ): Promise<ApiResponse<{ access_token: string; user: UserResponseDto }>> {
    const user = await this.validateUser(
      authLoginDto.email,
      authLoginDto.password,
    );
    if (!user) {
      return ApiResponse.error('Invalid credentials', 'Invalid password');
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
}
