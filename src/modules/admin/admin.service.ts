import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Admin, AdminDocument } from "./entities/admin.entity";
import { Model } from "mongoose";
import { AdminUpdateDto } from "./dto/admin-update.dto";
import { AuthSignDto } from "../auth/dto/auth-sign.dto";
import { ApiResponse } from "src/common/response/api.response";
import * as bcrypt from 'bcrypt';

import { plainToInstance } from "class-transformer";
import { AdminResponseDto } from "./dto/admin-response.dto";

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    ) {}


    async createAdmin(authSignDto: AuthSignDto): Promise<ApiResponse<AdminResponseDto>> {
        const hashedPassword = await bcrypt.hash(authSignDto.password, 10);
        const createdAdmin = new this.adminModel({
            ...authSignDto,
            password: hashedPassword
        });
        const savedAdmin = await createdAdmin.save();
        if(!savedAdmin){
            return ApiResponse.error('Admin not created', 'Admin creation failed');
        }
        return ApiResponse.success('Admin created successfully', plainToInstance(AdminResponseDto, savedAdmin.toObject()));
    }
    
    async findById(id: string): Promise<ApiResponse<AdminResponseDto>> {
        const admin = await this.adminModel.findById(id);
        if(!admin){
            return ApiResponse.error('Admin not found', 'Admin not found');
        }
        return ApiResponse.success('Admin found successfully', plainToInstance(AdminResponseDto, admin.toObject()));
    }

    async findByEmail(email: string): Promise< ApiResponse<AdminDocument | null>> {
        const admin = await this.adminModel.findOne({ email });
        if(!admin){
            return ApiResponse.error('Admin not found with this email', 'Admin not found');
        }
        return ApiResponse.success('Admin found successfully', admin);
    }
    
    async updateAdmin(id: string, adminUpdateDto: AdminUpdateDto): Promise<ApiResponse<AdminResponseDto>> {
        const admin = await this.findById(id);
        if(!admin){
            return ApiResponse.error('Admin not found', 'Admin not found');
        }
        if(adminUpdateDto.password){
            adminUpdateDto.password = await bcrypt.hash(adminUpdateDto.password, 10);
        }
        const updatedAdmin = await this.adminModel.findByIdAndUpdate(id, adminUpdateDto, { new: true });
        
        if(!updatedAdmin){
            return ApiResponse.error('Admin not updated', 'Admin not updated');
        }

        return ApiResponse.success('Admin updated successfully', plainToInstance(AdminResponseDto, updatedAdmin.toObject()));
    }

    async deleteAdmin(id: string): Promise<ApiResponse<boolean>> {
        const admin = await this.findById(id);
        if(!admin){
            return ApiResponse.error('Admin not found', 'Admin not found');
        }
        const deletedAdmin = await this.adminModel.findByIdAndDelete(id);
        if(!deletedAdmin){
            return ApiResponse.error('Admin not deleted', 'Admin deletion Faild');
        }
        return ApiResponse.success('Admin deleted successfully', true);
    }
   
}
