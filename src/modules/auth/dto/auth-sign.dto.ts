import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/common/enums/user-role.enum';

export class AuthSignDto {
  @ApiProperty({
    description: 'The username for the new account',
    example: 'johndoe',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    description: 'The email address for the new account',
    example: 'johndoe@example.com',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The role assigned to the user',
    enum: UserRole,
    required: false,
    default: UserRole.USER,
  })
  @IsString()
  @IsOptional()
  role?: UserRole;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'The password for the new account',
    example: 'StrongPassword123!',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'The start date of the trial period',
    required: false,
    type: String,
    format: 'date-time',
  })
  @IsString()
  @IsOptional()
  trailStartDate?: Date;

  @ApiProperty({
    description: 'The end date of the trial period',
    required: false,
    type: String,
    format: 'date-time',
  })
  @IsString()
  @IsOptional()
  trailEndDate?: Date;
}
