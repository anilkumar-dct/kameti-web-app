import { Controller, Get, Request, UseGuards, Body, Delete, Patch } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AdminService } from './admin.service';
import { AdminUpdateDto } from './dto/admin-update.dto';

interface AuthenticatedRequest extends ExpressRequest {
    user: {
        userId: number;
    }
}

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}
    @UseGuards(AdminAuthGuard)
    @Get('profile')
    async getAdminProfile(@Request() req: AuthenticatedRequest) {
        return this.adminService.findById(req.user.userId.toString());
    }

    @UseGuards(AdminAuthGuard)
    @Patch('profile')
    async updateAdmin(@Request() req: AuthenticatedRequest, @Body() adminUpdateDto: AdminUpdateDto) {
        return this.adminService.updateAdmin(req.user.userId.toString(), adminUpdateDto);
    }

    @UseGuards(AdminAuthGuard)
    @Delete('profile')
    async deleteAdmin(@Request() req: AuthenticatedRequest) {
        return this.adminService.deleteAdmin(req.user.userId.toString());
    }

}
