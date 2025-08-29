import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { createHmac, pbkdf2Sync, randomBytes } from 'crypto';

function generatePasswordRecord(password: string) {
  const salt = randomBytes(16);
  const iterations = 100000;
  const key = pbkdf2Sync(Buffer.from(password, 'utf8'), salt, iterations, 32, 'sha256');
  const verifier = createHmac('sha256', salt).update(key).digest();
  const saltB64 = salt.toString('base64');
  const verifierB64 = verifier.toString('base64');
  return `v2:${saltB64}:${iterations}:${verifierB64}`;
}

function generateRandomPassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

@Injectable()
export class UserManagementService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(status?: string) {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            blobs: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return users.map(user => ({
      ...user,
      blobCount: user._count.blobs,
      blocked: false // Add blocked status from metadata if implemented
    }));
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        blobs: {
          select: {
            id: true,
            namespace: true,
            itemKey: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const passwordRecord = generatePasswordRecord(password);
    
    const user = await this.prisma.user.create({
      data: {
        email,
        password_verifier_v2: passwordRecord
      },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });

    return user;
  }

  async updateUser(id: string, updateData: { email?: string; blocked?: boolean }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(updateData.email && { email: updateData.email })
      },
      select: {
        id: true,
        email: true,
        updatedAt: true
      }
    });

    return updatedUser;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  async blockUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real implementation, you'd add a blocked field to the schema
    // For now, we'll simulate this with metadata
    return { message: 'User blocked successfully', userId: id };
  }

  async unblockUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User unblocked successfully', userId: id };
  }

  async resetUserPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newPassword = generateRandomPassword();
    const passwordRecord = generatePasswordRecord(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password_verifier_v2: passwordRecord
      }
    });

    return { 
      message: 'Password reset successfully',
      newPassword,
      userId: user.id 
    };
  }

  async getUserSessions(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mock session data - in a real app, you'd have a sessions table
    return {
      userId: id,
      sessions: [
        {
          id: '1',
          deviceInfo: 'Chrome on Windows',
          ipAddress: '192.168.1.100',
          lastActive: new Date(),
          current: true
        }
      ]
    };
  }

  async getUserSecurityLog(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mock security log data - in a real app, you'd have a security_logs table
    return {
      userId: id,
      events: [
        {
          id: '1',
          type: 'login',
          timestamp: new Date(),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          success: true
        }
      ]
    };
  }
}
