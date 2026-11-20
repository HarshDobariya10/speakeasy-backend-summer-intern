import { Injectable } from '@nestjs/common';
import { VenueApiKey, Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { VenueApiKeyCoreDto } from './dto/venue-api-key-core.dto';
import { PrismaBaseRepository } from 'src/shared/libs/prisma-base.repository';
import { VenueApiKeyMessages } from 'src/shared/keys/venue-api-key.keys';

@Injectable()
export class VenueApiKeyCoreService extends PrismaBaseRepository<
  VenueApiKey,
  VenueApiKeyCoreDto,
  Prisma.VenueApiKeyCreateArgs,
  Prisma.VenueApiKeyUpdateArgs,
  Prisma.VenueApiKeyUpdateManyArgs,
  Prisma.VenueApiKeyFindUniqueArgs,
  Prisma.VenueApiKeyFindFirstArgs,
  Prisma.VenueApiKeyFindManyArgs,
  Prisma.VenueApiKeyDeleteArgs,
  Prisma.VenueApiKeyDeleteManyArgs,
  Prisma.VenueApiKeyCountArgs
> {
  constructor(prismaService: PrismaService) {
    super(prismaService.prisma.venueApiKey, {
      NOT_FOUND: VenueApiKeyMessages.NOT_FOUND,
      DELETED: VenueApiKeyMessages.DELETED,
    });
  }

  async findByApiKey(apiKey: string): Promise<VenueApiKey | null> {
    return this.findFirst({
      where: { apiKey },
    });
  }

  async findActiveByVenueId(venueId: string): Promise<VenueApiKey[]> {
    return this.findMany({
      where: { venueId, isActive: true, isDeleted: false },
    });
  }
}
