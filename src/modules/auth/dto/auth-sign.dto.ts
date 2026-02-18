import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UserRole } from "src/common/enums/user-role.enum";

export class AuthSignDto {
    @IsString()
    @IsNotEmpty()
    userName: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    role?: UserRole;

    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString() 
    @IsOptional()
    trailStartDate?: Date;

    @IsString()
    @IsOptional()
    trailEndDate?: Date;
}