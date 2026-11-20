import { Injectable } from '@nestjs/common';
import { AdminSession, Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { AdminSessionCorePaginateDto } from './dto/admin-session-core.dto';
import { PrismaBaseRepository } from 'src/shared/libs/prisma-base.repository';
import { AdminSessionMessages } from 'src/shared/keys/admin-session.keys';

@Injectable()
export class AdminSessionCoreService extends PrismaBaseRepository<
  AdminSession,
  AdminSessionCorePaginateDto,
  Prisma.AdminSessionCreateArgs,
  Prisma.AdminSessionUpdateArgs,
  Prisma.AdminSessionUpdateManyArgs,
  Prisma.AdminSessionFindUniqueArgs,
  Prisma.AdminSessionFindFirstArgs,
  Prisma.AdminSessionFindManyArgs,
  Prisma.AdminSessionDeleteArgs,
  Prisma.AdminSessionDeleteManyArgs,
  Prisma.AdminSessionCountArgs
> {
  constructor(private prismaService: PrismaService) {
    super(prismaService.prisma.adminSession, {
      NOT_FOUND: AdminSessionMessages.NOT_FOUND,
      DELETED: AdminSessionMessages.DELETED,
    });
  }
}
