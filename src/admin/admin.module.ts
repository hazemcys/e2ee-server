import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
})
export class AdminModule {}
