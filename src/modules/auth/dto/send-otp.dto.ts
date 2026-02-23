import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OtpType } from '../enums/otp-type';

export class SendOtpDto {
  @ApiProperty({
    description: 'The email address to send the OTP to',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The username for the new account (required for signup)',
    example: 'johndoe',
    required: false,
  })
  @IsString()
  @IsOptional()
  userName?: string;

  @ApiProperty({
    description: 'The purpose of the OTP',
    enum: OtpType,
    example: OtpType.SIGNUP,
    required: true,
  })
  @IsEnum(OtpType)
  @IsNotEmpty()
  type: OtpType;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'The email address associated with the OTP',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The OTP code received by the user',
    example: '123456',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    description: 'The purpose of the OTP',
    enum: OtpType,
    example: OtpType.SIGNUP,
    required: true,
  })
  @IsEnum(OtpType)
  @IsNotEmpty()
  type: OtpType;
}
