import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "./interface";
import { Admin } from "src/modules/admin/entities/admin.entity";
import { ConfigService } from "src/config/config.service";
import { AdminService } from "src/modules/admin/admin.service";
import { AdminResponseDto } from "src/modules/admin/dto/admin-response.dto";
import { Response } from "express";

@Injectable()
export class AuthTokenGenerateService {
    constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService, private readonly adminService: AdminService) {}

    generateToken(admin: AdminResponseDto): string {
        const payload: JwtPayload = {
            id: admin._id.toString(),
        };

        const expiresIn = this.configService.jwtExpiration;
        return this.jwtService.sign(payload, {
            expiresIn,
        } as any);
    }

    async validateUser(userId: number): Promise<AdminResponseDto> {
        const admin = await this.adminService.findById(userId.toString());
        if(!admin){
            throw new Error("Admin not found");
        }
        return admin.data!;
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