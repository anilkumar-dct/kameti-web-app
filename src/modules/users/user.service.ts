import { Injectable } from "@nestjs/common";
import { User, UserDocument } from "./entities/user.entity";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ApiResponse } from "src/common/response/api.response";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";


@Injectable()
export class UserService {
 constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
 ) {}  
 
 async createUser(createUserDto: CreateUserDto): Promise<ApiResponse<UserDocument>> {
    const user = await this.userModel.create(createUserDto);
    if(!user){
        return ApiResponse.error("User not created", "User creation failed");
    }
    return ApiResponse.success("User created successfully", user);
 }

 async findById(id: string): Promise<ApiResponse<UserDocument>> {
    const user = await this.userModel.findById(id);
    if(!user){
        return ApiResponse.error("User not found", "User not found");
    }
    return ApiResponse.success("User found successfully", user);
 }

 async findAll(): Promise<ApiResponse<UserDocument[]>> {
    const users = await this.userModel.find();
    if(!users){
        return ApiResponse.error("Users not found", "Users not found");
    }
    return ApiResponse.success("Users found successfully", users);
 }  


 async update(id: string, updateUserDto: UpdateUserDto): Promise<ApiResponse<UserDocument>> {
    const user = await this.findById(id);
    if(!user){
        return ApiResponse.error("User not found", "User not found");
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
    if(!updatedUser){
        return ApiResponse.error("User not updated", "User update failed");
    }
    return ApiResponse.success("User updated successfully", updatedUser);
 }

}