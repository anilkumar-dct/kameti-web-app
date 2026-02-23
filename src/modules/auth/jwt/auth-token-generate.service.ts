import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interface';
import { ConfigService } from 'src/config/config.service';
import { UserService } from 'src/modules/users/user.service';
import { UserResponseDto } from 'src/common/dto/user-response.dto';
import { Response } from 'express';

@Injectable()
export class AuthTokenGenerateService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  generateToken(user: UserResponseDto): string {
    const payload: JwtPayload = {
      id: user._id.toString(),
      role: user.role,
    };

    const expiresIn = this.configService.jwtExpiration;
    return this.jwtService.sign(payload, {
      expiresIn: expiresIn as unknown as number,
    });
  }

  async validateUser(userId: string): Promise<UserResponseDto> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.data!;
  }

  storeValueInCookie(res: Response, key: string, value: string): void {
    res.cookie(key, value, {
      httpOnly: true,
      secure: this.configService.isProduction,
      sameSite: this.configService.isProduction ? 'none' : 'lax',
      maxAge: this.configService.cookieMaxAge,
      path: '/',
    });
  }
}
