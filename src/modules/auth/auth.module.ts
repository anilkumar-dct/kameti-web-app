
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../users/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/strategies/jwt.strategy';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { AuthTokenGenerateService } from './jwt/auth-token-generate.service';
import { Otp, OtpSchema } from '../../common/entities/otp.entity';
import { OtpService } from './services/otp.service';
import { MailService } from './services/mail.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule,
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
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
  providers: [AuthService, JwtStrategy, AuthTokenGenerateService, OtpService, MailService],
  exports: [AuthService, AuthTokenGenerateService]
})
export class AuthModule {}
