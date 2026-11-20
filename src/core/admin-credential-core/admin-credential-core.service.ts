import { Injectable } from '@nestjs/common';
import { AdminCredential, Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { AdminCredentialCorePaginateDto } from './dto/admin-credential-core.dto';
import { PrismaBaseRepository } from 'src/shared/libs/prisma-base.repository';
import { AdminCredentialMessages } from 'src/shared/keys/admin-credential.keys';

@Injectable()
export class AdminCredentialCoreService extends PrismaBaseRepository<
  AdminCredential,
  AdminCredentialCorePaginateDto,
  Prisma.AdminCredentialCreateArgs,
  Prisma.AdminCredentialUpdateArgs,
  Prisma.AdminCredentialUpdateManyArgs,
  Prisma.AdminCredentialFindUniqueArgs,
  Prisma.AdminCredentialFindFirstArgs,
  Prisma.AdminCredentialFindManyArgs,
  Prisma.AdminCredentialDeleteArgs,
  Prisma.AdminCredentialDeleteManyArgs,
  Prisma.AdminCredentialCountArgs
> {
  constructor(private prismaService: PrismaService) {
    super(prismaService.prisma.adminCredential, {
      NOT_FOUND: AdminCredentialMessages.NOT_FOUND,
      DELETED: AdminCredentialMessages.DELETED,
    });
  }
}
