import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { AdminSessionCoreService } from './admin-session-core.service';

@Module({
  providers: [PrismaService, AdminSessionCoreService],
  exports: [AdminSessionCoreService, PrismaService],
})
export class AdminSessionCoreModule {}
