import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import {
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/response/api.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from '../../common/dto/user-response.dto';
import { type AuthenticatedRequest } from './interface/authenticated-request';

/**
 * Controller for user management and profile operations.
 */
@ApiTags('Users')
@ApiCookieAuth('access_token')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Endpoint to create a new user.
   */
  @Post('create')
  @ApiOperation({ summary: 'Create a new user' })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: ApiSuccessResponse,
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists',
    type: ApiErrorResponse,
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.userService.createUser(createUserDto);
  }

  /**
   * Endpoint to retrieve all users (Admin only).
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Users found successfully',
    type: ApiSuccessResponse,
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
    type: ApiErrorResponse,
  })
  async findAll(): Promise<ApiResponse<UserResponseDto[]>> {
    return await this.userService.findAll();
  }

  /**
   * Endpoint to get the current user's profile.
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Profile found successfully',
    type: ApiSuccessResponse,
  })
  async getProfile(
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.userService.findById(req.user.userId.toString());
  }

  /**
   * Endpoint to update a user's information.
   */
  @Patch('update')
  @ApiOperation({ summary: 'Update user information' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    type: ApiSuccessResponse,
  })
  async update(
    @Query('email') email: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.userService.update(email, updateUserDto);
  }

  /**
   * Endpoint to find a specific user by ID (Admin only).
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Find user by ID (Admin only)' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'User found',
    type: ApiSuccessResponse,
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    type: ApiErrorResponse,
  })
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.userService.findById(id);
  }
}
