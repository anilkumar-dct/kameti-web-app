import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UserDocument } from "./entities/user.entity";
import { ApiResponse } from "src/common/response/api.response";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { AdminAuthGuard } from "../auth/admin-auth.guard";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<UserDocument>> {
        return this.userService.createUser(createUserDto);
    }

    @UseGuards(AdminAuthGuard)
    @Get()
    async findAll(): Promise<ApiResponse<UserDocument[]>> {
        return this.userService.findAll();
    }

    @UseGuards(AdminAuthGuard)
    @Get(':id')
    async findById(@Param('id') id: string): Promise<ApiResponse<UserDocument>> {
        return this.userService.findById(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<ApiResponse<UserDocument>> {
        return this.userService.update(id, updateUserDto);
    }
}
