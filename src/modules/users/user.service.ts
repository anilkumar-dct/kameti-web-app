import { Injectable, HttpStatus } from '@nestjs/common';
import { User, UserDocument } from 'src/common/entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ApiResponse } from 'src/common/response/api.response';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/common/dto/user-response.dto';
import * as bcrypt from 'bcrypt';

/**
 * Service for managing user data and operations.
 */
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Creates a new user or updates an existing one (except for Admin).
   * @param createUserDto - User details
   * @returns ApiResponse with the created/updated user
   */
  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const existingUser = await this.findByEmail(createUserDto.email);

    if (existingUser.data) {
      if (existingUser.data.role === UserRole.ADMIN) {
        return ApiResponse.error(
          'User already exists',
          'User already exists',
          HttpStatus.CONFLICT,
        );
      }

      const updatedUserDto: UpdateUserDto = {
        ...createUserDto,
        trailStartDate: existingUser.data.trailStartDate,
        trailEndDate: existingUser.data.trailEndDate,
      };

      const updatedUser = await this.update(
        existingUser.data.email,
        updatedUserDto,
      );
      return ApiResponse.fail(
        'User already exists',
        'User already exists',
        updatedUser.data,
        HttpStatus.CONFLICT,
      );
    }

    const { password, role, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = (role || UserRole.USER) as UserRole;
    const isAdmin = userRole === UserRole.ADMIN;

    const user = await this.userModel.create({
      ...rest,
      password: hashedPassword,
      role: userRole,
      trailStartDate: isAdmin
        ? null
        : createUserDto.trailStartDate
          ? createUserDto.trailStartDate
          : new Date(),
      trailEndDate: isAdmin
        ? null
        : createUserDto.trailEndDate
          ? createUserDto.trailEndDate
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    if (!user) {
      return ApiResponse.error(
        'User not created',
        'User creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return ApiResponse.success(
      'User created successfully',
      plainToInstance(UserResponseDto, user.toObject()),
      HttpStatus.CREATED,
    );
  }

  /**
   * Finds a user by their email.
   * @param email - User's email
   * @returns ApiResponse with the user document
   */
  async findByEmail(email: string): Promise<ApiResponse<UserDocument | null>> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return ApiResponse.fail(
        'User not found with this email',
        'User not found',
        null,
        HttpStatus.NOT_FOUND,
      );
    }
    return ApiResponse.success('User found successfully', user);
  }

  /**
   * Finds a user by their ID.
   * @param id - User's unique ID
   * @returns ApiResponse with the user record
   */
  async findById(id: string): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.userModel.findById(id);
    if (!user) {
      return ApiResponse.error(
        'User not found',
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return ApiResponse.success(
      'User found successfully',
      plainToInstance(UserResponseDto, user.toObject()),
    );
  }

  /**
   * Retrieves all users.
   * @returns ApiResponse with a list of users
   */
  async findAll(): Promise<ApiResponse<UserResponseDto[]>> {
    const users = await this.userModel.find();
    return ApiResponse.success(
      'Users found successfully',
      plainToInstance(
        UserResponseDto,
        users.map((u) => u.toObject()),
      ),
    );
  }

  /**
   * Updates an existing user's information.
   * @param email - User's email
   * @param updateUserDto - Updated fields
   * @returns ApiResponse with the updated user details
   */
  async update(
    email: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.findByEmail(email);
    if (!user.data) {
      return ApiResponse.error(
        'User not found',
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Role-based trial date management on update
    if (user.data.role) {
      if (user.data.role === UserRole.ADMIN) {
        updateUserDto.trailStartDate = null;
        updateUserDto.trailEndDate = null;
      } else if (user.data.role === UserRole.USER) {
        updateUserDto.trailStartDate = user.data.trailStartDate;
        updateUserDto.trailEndDate = user.data.trailEndDate;
      }
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      user.data._id.toString(),
      updateUserDto,
      { returnDocument: 'after' },
    );

    if (!updatedUser) {
      return ApiResponse.error(
        'User not updated',
        'User update failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return ApiResponse.success(
      'User updated successfully',
      plainToInstance(UserResponseDto, updatedUser.toObject()),
    );
  }
}
