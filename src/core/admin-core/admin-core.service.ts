import { Injectable } from '@nestjs/common';
import { Admin, Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { AdminCorePaginateDto } from './dto/admin-core.dto';
import { PrismaBaseRepository } from 'src/shared/libs/prisma-base.repository';
import { AdminMessages } from 'src/shared/keys/admin.keys';

@Injectable()
export class AdminCoreService extends PrismaBaseRepository<
  Admin,
  AdminCorePaginateDto,
  Prisma.AdminCreateArgs,
  Prisma.AdminUpdateArgs,
  Prisma.AdminUpdateManyArgs,
  Prisma.AdminFindUniqueArgs,
  Prisma.AdminFindFirstArgs,
  Prisma.AdminFindManyArgs,
  Prisma.AdminDeleteArgs,
  Prisma.AdminDeleteManyArgs,
  Prisma.AdminCountArgs
> {
  constructor(private prismaService: PrismaService) {
    super(prismaService.prisma.admin, {
      NOT_FOUND: AdminMessages.NOT_FOUND,
      DELETED: AdminMessages.DELETED,
    });
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return this.findFirst({
      where: { email, isDeleted: false },
    });
  }

  async findByPhone(phone: string, code?: string): Promise<Admin | null> {
    return this.findFirst({
      where: { phone, code, isDeleted: false },
    });
  }
}
