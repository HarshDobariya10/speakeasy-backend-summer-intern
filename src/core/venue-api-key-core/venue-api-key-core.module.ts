import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { VenueApiKeyCoreService } from './venue-api-key-core.service';

@Module({
  providers: [PrismaService, VenueApiKeyCoreService],
  exports: [VenueApiKeyCoreService, PrismaService],
})
export class VenueApiKeyCoreModule {}
