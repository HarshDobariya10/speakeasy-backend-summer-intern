import { Injectable } from '@nestjs/common';
import { Prisma, Venue } from '@prisma/client';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { VenueCorePaginateDto } from './dto/venue-core.dto';
import { PrismaBaseRepository } from 'src/shared/libs/prisma-base.repository';
import { VenueMessages } from 'src/shared/keys/venue.keys';

@Injectable()
export class VenueCoreService extends PrismaBaseRepository<
  Venue,
  VenueCorePaginateDto,
  Prisma.VenueCreateArgs,
  Prisma.VenueUpdateArgs,
  Prisma.VenueUpdateManyArgs,
  Prisma.VenueFindUniqueArgs,
  Prisma.VenueFindFirstArgs,
  Prisma.VenueFindManyArgs,
  Prisma.VenueDeleteArgs,
  Prisma.VenueDeleteManyArgs,
  Prisma.VenueCountArgs
> {
  constructor(prismaService: PrismaService) {
    super(prismaService.prisma.venue, {
      NOT_FOUND: VenueMessages.NOT_FOUND,
      DELETED: VenueMessages.DELETED,
    });
  }

  async findByName(venueName: string): Promise<Venue | null> {
    return this.findFirst({
      where: { venueName, isDeleted: false },
    });
  }

  async findByProvider(provider: Venue['posProvider']): Promise<Venue[]> {
    return this.findMany({
      where: { posProvider: provider, isDeleted: false },
    });
  }
}
