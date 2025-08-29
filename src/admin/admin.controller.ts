import { Controller, Delete, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Delete('user/:email')
  async deleteUser(@Param('email') email: string, @Headers('x-admin-secret') adminSecret: string) {
    const expectedSecret = process.env.ADMIN_SECRET;
    if (!expectedSecret || adminSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid admin secret');
    }

    const deleted = await this.prisma.user.delete({
      where: { email: email.toLowerCase() }
    });

    return { deleted: true, email: deleted.email };
  }

}
