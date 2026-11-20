import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { VenueCoreService } from './venue-core.service';

@Module({
  providers: [PrismaService, VenueCoreService],
  exports: [VenueCoreService, PrismaService],
})
export class VenueCoreModule {}
