import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { AdminCoreService } from './admin-core.service';

@Module({
  providers: [PrismaService, AdminCoreService],
  exports: [AdminCoreService, PrismaService],
})
export class AdminCoreModule {}
