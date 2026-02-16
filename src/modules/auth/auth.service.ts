
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service';
import { AuthSignDto } from './dto/auth-sign.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import * as bcrypt from 'bcrypt';
import { AdminResponseDto } from '../admin/dto/admin-response.dto';
import { ApiResponse } from 'src/common/response/api.response';
import { AuthTokenGenerateService } from './jwt/auth-token-generate.service';
import { Response } from 'express';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class AuthService {
  constructor(
    private adminService: AdminService,
    private authTokenGenerateService: AuthTokenGenerateService,
    private configService: ConfigService,

  ) {}

  async register(authSignDto: AuthSignDto, res: Response): Promise<ApiResponse<{access_token: string, user: AdminResponseDto}>> {
    // Check if user already exists
    const existingAdmin = await this.adminService.findByEmail(authSignDto.email);
    if (existingAdmin.data) {
        throw new Error('Admin already exists');
    }
    // AdminService hashes the password now
    const admin = await this.adminService.createAdmin(authSignDto); 
    if(!admin || !admin.data){
        throw new Error("Admin not created");
    }

    const accessToken = this.authTokenGenerateService.generateToken(admin.data);

    this.authTokenGenerateService.storeValueInCookie(res, this.configService.cookieName, accessToken);

    return ApiResponse.success("Admin created successfully", {
        access_token: accessToken,
        user: admin.data
    });
  }

  private async validateUser(email: string, pass: string): Promise<AdminResponseDto | null> {
    const user = await this.adminService.findByEmail(email);
    if (user.data && (await bcrypt.compare(pass, user.data.password))) {
      const { password, ...result } = user.data.toObject();
      return result;
    }
    return null;
  }

  async login(authLoginDto: AuthLoginDto, res: Response): Promise<ApiResponse<{access_token: string, user: AdminResponseDto}>> {
    const user = await this.validateUser(authLoginDto.email, authLoginDto.password);
    if (!user) {
      return ApiResponse.error("Invalid credentials", "Invalid password");
    }
    const accessToken = this.authTokenGenerateService.generateToken(user);
    this.authTokenGenerateService.storeValueInCookie(res, this.configService.cookieName, accessToken);
    return ApiResponse.success("Login successful", {
      access_token: accessToken,
      user: user
    });
  }

}
