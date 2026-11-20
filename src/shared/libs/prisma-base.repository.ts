import { NotFoundException } from '@nestjs/common';
import { BaseQueryCoreService } from 'src/core/base-query-core/base-query-core.service';
import {
  BaseQueryCoreDto,
  CoreIncludesDto,
} from 'src/core/base-query-core/dto/base-query-core.dto';
import { safePrismaCall } from 'src/shared/modules/prisma/safe-prisma-call';

type ErrorMessageType = 'NOT_FOUND' | 'DELETED';

export type ServiceErrorMessage = {
  [key in ErrorMessageType]: string;
};

export abstract class PrismaBaseRepository<
  ModelEntity,
  ModelPaginate,
  CreateArgs,
  UpdateArgs extends { where: Record<string, any> },
  UpdateManyArgs extends { where?: Record<string, any> },
  FindUniqueArgs extends { where: Record<string, any> },
  FindFirstArgs extends { where?: Record<string, any> },
  FindManyArgs extends {
    where?: Record<string, any>;
    skip?: number;
    take?: number;
  },
  DeleteArgs extends { where: Record<string, any> },
  DeleteManyArgs extends { where?: Record<string, any> },
  CountArgs extends { where?: Record<string, any> },
> {
  constructor(
    private readonly repo: any,
    public errorMessage: ServiceErrorMessage,
    public baseQueryCoreService: any = new BaseQueryCoreService(),
  ) {}

  /**
   * Get repository model for read operations (uses read replica if configured)
   * By default, read operations automatically use read replicas via the extension
   */
  protected getReadRepo(): any {
    // If repo has $replica method (read replicas extension enabled), use replica for reads
    if (this.repo.$replica && typeof this.repo.$replica === 'function') {
      return this.repo.$replica();
    }
    return this.repo;
  }

  /**
   * Get repository model for write operations (uses primary/write database)
   * By default, write operations automatically use primary via the extension
   */
  protected getWriteRepo(): any {
    // If repo has $primary method (read replicas extension enabled), use primary for writes
    if (this.repo.$primary && typeof this.repo.$primary === 'function') {
      return this.repo.$primary();
    }
    return this.repo;
  }

  async findPaginate(
    query: BaseQueryCoreDto,
    baseWhere = {},
  ): Promise<ModelPaginate | any> {
    const updatedQuery = this.baseQueryCoreService.generatePrismaQuery(query);

    const { skip = 0, take = 10, where = {}, ...rest } = updatedQuery;

    let list = await safePrismaCall(() =>
      this.getReadRepo().findMany({
        skip,
        take: take + 1,
        where: {
          ...where,
          ...baseWhere,
        },
        ...rest,
      }),
    );

    const total = await safePrismaCall(() =>
      this.getReadRepo().count({
        where: {
          ...where,
          ...baseWhere,
        },
      }),
    );

    let hasMany = false;
    if (list.length > take) {
      hasMany = true;
      list = list.slice(0, -1);
    }

    return {
      total,
      list,
      hasMany,
      count: list.length,
    };
  }

  async findPaginateV2(
    query: BaseQueryCoreDto,
    baseWhere = {},
  ): Promise<ModelPaginate | any> {
    const updatedQuery = this.baseQueryCoreService.generatePrismaQuery(query);

    const { where = {}, ...rest } = updatedQuery;

    const list = await safePrismaCall(() =>
      this.getReadRepo().findMany({
        where: {
          ...where,
          ...baseWhere,
        },
        ...rest,
      }),
    );

    return {
      list,
      count: list.length,
    };
  }

  async checkId(params: { where: any }): Promise<ModelEntity> {
    return safePrismaCall(() =>
      this.getReadRepo().findUnique({ where: params.where }),
    ).catch(() => {
      throw new NotFoundException(this.errorMessage.NOT_FOUND);
    });
  }

  create(params: CreateArgs): Promise<ModelEntity> {
    return safePrismaCall(() => this.getWriteRepo().create(params));
  }

  async getCount(params: CountArgs): Promise<any> {
    return safePrismaCall(() => this.getReadRepo().count(params));
  }

  async update(params: UpdateArgs): Promise<ModelEntity> {
    await this.checkId({ where: params.where });
    return safePrismaCall(() => this.getWriteRepo().update(params));
  }

  async updateWithRetry(
    params: UpdateArgs,
    maxRetries = 3,
  ): Promise<ModelEntity> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await safePrismaCall(() => this.getWriteRepo().update(params));
      } catch (error: any) {
        // Check if it's a deadlock error (MySQL error code 1213)
        // Prisma may expose error code as string '1213', number 1213, or in error.meta.code
        const isDeadlock =
          error.code === '1213' ||
          error.code === 1213 ||
          error.meta?.code === '1213' ||
          error.meta?.code === 1213 ||
          (error.message &&
            error.message.includes('Deadlock found when trying to get lock'));

        if (isDeadlock && attempt < maxRetries) {
          console.warn(
            `Deadlock detected in update (attempt ${attempt}/${maxRetries}). Retrying...`,
            { where: params.where },
          );
          // Exponential backoff with jitter to reduce collision probability
          const delay = Math.random() * (1000 * Math.pow(2, attempt - 1));
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        // Re-throw if it's not a deadlock or we've exhausted retries
        throw error;
      }
    }
    // This should never be reached, but included as a safety net
    throw new Error('Max retries exceeded for update operation');
  }

  updateMany(params: UpdateManyArgs): Promise<{ count: number }> {
    return safePrismaCall(() => this.getWriteRepo().updateMany(params));
  }

  async updateManyWithRetry(
    params: UpdateManyArgs,
    maxRetries: number,
  ): Promise<{ count: number }> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await safePrismaCall(() =>
          this.getWriteRepo().updateMany(params),
        );
      } catch (error: any) {
        // Check if it's a deadlock error (MySQL error code 1213)
        // Prisma may expose error code as string '1213', number 1213, or in error.meta.code
        const isDeadlock =
          error.code === '1213' ||
          error.code === 1213 ||
          error.meta?.code === '1213' ||
          error.meta?.code === 1213 ||
          (error.message &&
            error.message.includes('Deadlock found when trying to get lock'));

        if (isDeadlock && attempt < maxRetries) {
          console.warn(
            `Deadlock detected in updateMany (attempt ${attempt}/${maxRetries}). Retrying...`,
          );
          // Exponential backoff with jitter to reduce collision probability
          const delay = Math.random() * (1000 * Math.pow(2, attempt - 1));
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        // Re-throw if it's not a deadlock or we've exhausted retries
        throw error;
      }
    }
    // This should never be reached, but included as a safety net
    throw new Error('Max retries exceeded for updateMany operation');
  }

  async findUnique(params: FindUniqueArgs): Promise<ModelEntity> {
    const returnData = await safePrismaCall(() =>
      this.getReadRepo().findUnique(params),
    ).catch(() => {
      throw new NotFoundException(this.errorMessage.NOT_FOUND);
    });

    if (returnData?.isDeleted) {
      throw new NotFoundException(this.errorMessage.DELETED);
    }

    return returnData;
  }

  findFirst(params: FindFirstArgs): Promise<ModelEntity> {
    return safePrismaCall(() => this.getReadRepo().findFirst(params)).catch(
      () => {
        throw new NotFoundException(this.errorMessage.NOT_FOUND);
      },
    );
  }

  findMany(params: FindManyArgs): Promise<ModelEntity[]> {
    return safePrismaCall(() => this.getReadRepo().findMany(params));
  }

  deleteMany(params: DeleteManyArgs): Promise<void> {
    return safePrismaCall(() =>
      this.getWriteRepo().deleteMany(params),
    ) as unknown as Promise<void>;
  }

  async delete(params: DeleteArgs): Promise<ModelEntity> {
    await this.checkId({ where: params.where });
    return safePrismaCall(() => this.getWriteRepo().delete(params));
  }

  async findUniqueIncludes(
    params: FindUniqueArgs,
    query: CoreIncludesDto,
  ): Promise<ModelEntity> {
    const updatedQuery = this.baseQueryCoreService.generatePrismaQuery(query);
    const returnData = await safePrismaCall(() =>
      this.getReadRepo().findUnique({ ...params, ...updatedQuery }),
    ).catch(() => {
      throw new NotFoundException(this.errorMessage.NOT_FOUND);
    });
    if (returnData?.isDeleted) {
      throw new NotFoundException(this.errorMessage.DELETED);
    }
    return returnData;
  }

  async findFirstIncludes(
    params: FindFirstArgs,
    query: CoreIncludesDto,
  ): Promise<ModelEntity> {
    const updatedQuery = this.baseQueryCoreService.generatePrismaQuery(query);
    const returnData = await safePrismaCall(() =>
      this.getReadRepo().findFirst({ ...params, ...updatedQuery }),
    ).catch(() => {
      throw new NotFoundException(this.errorMessage.NOT_FOUND);
    });
    if (returnData?.isDeleted) {
      throw new NotFoundException(this.errorMessage.DELETED);
    }
    return returnData;
  }
}
