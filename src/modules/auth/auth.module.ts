
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminModule } from '../admin/admin.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/strategies/jwt.strategy';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { AuthTokenGenerateService } from './jwt/auth-token-generate.service';

@Module({
  imports: [
    AdminModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: configService.jwtExpiration } as any,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthTokenGenerateService],
  exports: [AuthService, AuthTokenGenerateService]
})
export class AuthModule {}
