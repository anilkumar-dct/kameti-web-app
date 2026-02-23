import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

@Injectable()
export class ConfigService {
    constructor(private readonly configService: NestConfigService) {}

    get port(): number {
        return this.configService.get<number>('PORT') || 8000;
    }

    get nodeEnv(): string {
        return this.configService.get<string>('NODE_ENV') || 'development';
    }

    get databaseUrl(): string {
        return this.configService.get<string>('DATABASE_URL') || '';
    }

    get isProduction(): boolean {
        return this.nodeEnv === 'production';
    }
    
    get jwtSecret(): string {
        return this.configService.get<string>('JWT_SECRET') || '';
    }

    get jwtExpiration(): string {
        return this.configService.get<string>('JWT_EXPIRES_IN') || '3600s';
    }

    get cookieName(): string {
        return this.configService.get<string>('COOKIE_NAME') || 'access_token';
    }

    get cookieMaxAge(): number {
        const maxAge = this.configService.get<string>('COOKIE_MAX_AGE');
        if (maxAge) {
            const parsed = Number(maxAge);
            if (!isNaN(parsed) && parsed > 0) {
                return parsed;
            }
        }
        // Default: 2 days in milliseconds
        return 172800000;
    }

    get smtpHost(): string {
        return this.configService.get<string>('SMTP_HOST') || '';
    }

    get smtpPort(): number {
        return Number(this.configService.get<number>('SMTP_PORT')) || 587;
    }

    get smtpUser(): string {
        return this.configService.get<string>('SMTP_USER') || '';
    }

    get smtpPassword(): string {
        return this.configService.get<string>('SMTP_PASS') || '';
    }

    get smtpSecure(): boolean {
        return this.configService.get<string>('SMTP_SECURE') === 'true';
    }
}