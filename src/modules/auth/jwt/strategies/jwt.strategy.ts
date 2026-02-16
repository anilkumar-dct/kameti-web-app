
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../interface';

import { ConfigService } from '../../../../config/config.service';
import { AdminService } from 'src/modules/admin/admin.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService, private adminService: AdminService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          return request?.cookies?.[configService.cookieName] || null;
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
    const admin = await this.adminService.findById(payload.id.toString());
    if(!admin || !admin.data){
      return null;
    }
    return { userId: payload.id };
  }
}
