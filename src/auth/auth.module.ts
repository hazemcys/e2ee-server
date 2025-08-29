import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserManagementController } from './user-management.controller.js';
import { UserManagementService } from './user-management.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { JwtGuard } from './jwt.guard.js';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [AuthService, UserManagementService, JwtGuard],
  controllers: [AuthController, UserManagementController],
  exports: [AuthService, UserManagementService, JwtGuard],
})
export class AuthModule {}
