import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { AdminCredentialCoreService } from './admin-credential-core.service';

@Module({
  providers: [PrismaService, AdminCredentialCoreService],
  exports: [AdminCredentialCoreService, PrismaService],
})
export class AdminCredentialCoreModule {}
