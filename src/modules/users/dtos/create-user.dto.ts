import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The username for the new user',
    example: 'johndoe',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    description: 'The email address of the new user',
    example: 'johndoe@example.com',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'The password for the account',
    example: 'StrongPassword123!',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'The role assigned to the user',
    example: 'USER',
    required: false,
  })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty({
    description: 'The start date of the trial period',
    required: false,
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  trailStartDate?: Date | null;

  @ApiProperty({
    description: 'The end date of the trial period',
    required: false,
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  trailEndDate?: Date | null;
}
