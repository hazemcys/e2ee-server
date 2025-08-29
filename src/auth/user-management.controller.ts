import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from './jwt.guard.js';
import { UserManagementService } from './user-management.service.js';

export interface CreateUserDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  email?: string;
  blocked?: boolean;
}

export interface ResetPasswordDto {
  email: string;
}

@Controller('api/users')
@UseGuards(JwtGuard)
export class UserManagementController {
  constructor(private userManagementService: UserManagementService) {}

  @Get()
  async getAllUsers(@Query('status') status?: string) {
    return this.userManagementService.getAllUsers(status);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userManagementService.getUserById(id);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userManagementService.createUser(createUserDto.email, createUserDto.password);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userManagementService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userManagementService.deleteUser(id);
  }

  @Post(':id/block')
  async blockUser(@Param('id') id: string) {
    return this.userManagementService.blockUser(id);
  }

  @Post(':id/unblock')
  async unblockUser(@Param('id') id: string) {
    return this.userManagementService.unblockUser(id);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.userManagementService.resetUserPassword(resetPasswordDto.email);
  }

  @Get(':id/sessions')
  async getUserSessions(@Param('id') id: string) {
    return this.userManagementService.getUserSessions(id);
  }

  @Get(':id/security-log')
  async getUserSecurityLog(@Param('id') id: string) {
    return this.userManagementService.getUserSecurityLog(id);
  }
}
