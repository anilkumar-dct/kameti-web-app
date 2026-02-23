import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../interface';
import { Request } from 'express';

import { ConfigService } from '../../../../config/config.service';
import { UserService } from 'src/modules/users/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const cookies = request.cookies as Record<string, string> | undefined;
          return cookies ? cookies[configService.cookieName] : null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.id) {
      return null;
    }
    const user = await this.userService.findById(payload.id.toString());
    if (!user || !user.data) {
      return null;
    }
    return { userId: payload.id, role: payload.role };
  }
}
