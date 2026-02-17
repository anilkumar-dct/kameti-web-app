import { Injectable } from "@nestjs/common";
import { User, UserDocument } from "src/common/entities/user.entity";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ApiResponse } from "src/common/response/api.response";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { UserRole } from "src/common/enums/user-role.enum";
import { plainToInstance } from "class-transformer";
import { UserResponseDto } from "src/common/dto/user-response.dto";
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
 constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
 ) {}  
 
  async createUser(createUserDto: CreateUserDto): Promise<ApiResponse<UserResponseDto>> {
    const { password, role, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userRole = role || UserRole.USER;
    const isAdmin = userRole === UserRole.ADMIN;

    const user = await this.userModel.create({
        ...rest,
        password: hashedPassword,
        role: userRole,
        trailStartDate: isAdmin ? null : new Date(),
        trailEndDate: isAdmin ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    if(!user){
        return ApiResponse.error("User not created", "User creation failed");
    }
    return ApiResponse.success("User created successfully", plainToInstance(UserResponseDto, user.toObject()));
  }

  async findByEmail(email: string): Promise<ApiResponse<UserDocument | null>> {
    const user = await this.userModel.findOne({ email });
    if(!user){
        return ApiResponse.error("User not found with this email", "User not found");
    }
    return ApiResponse.success("User found successfully", user);
  }

  async findById(id: string): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.userModel.findById(id);
    if(!user){
        return ApiResponse.error("User not found", "User not found");
    }
    return ApiResponse.success("User found successfully", plainToInstance(UserResponseDto, user.toObject()));
  }

  async findAll(): Promise<ApiResponse<UserResponseDto[]>> {
    const users = await this.userModel.find();
    return ApiResponse.success("Users found successfully", plainToInstance(UserResponseDto, users.map(u => u.toObject())));
  }  

  async update(id: string, updateUserDto: UpdateUserDto): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.userModel.findById(id);
    if(!user){
        return ApiResponse.error("User not found", "User not found");
    }

    const updateData: any = { ...updateUserDto };

    if(updateData.password){
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Role-based trial date management on update
    if (updateData.role) {
        if (updateData.role === UserRole.ADMIN) {
            updateData.trailStartDate = null;
            updateData.trailEndDate = null;
        } else if (updateData.role === UserRole.USER && !user.trailStartDate) {
            updateData.trailStartDate = new Date();
            updateData.trailEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, { new: true });
    if(!updatedUser){
        return ApiResponse.error("User not updated", "User update failed");
    }
    return ApiResponse.success("User updated successfully", plainToInstance(UserResponseDto, updatedUser.toObject()));
  }

}