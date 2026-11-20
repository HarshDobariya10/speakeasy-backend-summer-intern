import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AdminModule } from './modules/admin/admin.module';
import { VenueModule } from './modules/venue/venue.module';
import { VenueApiKeyModule } from './modules/venue-api-key/venue-api-key.module';
import { PrismaService } from './shared/modules/prisma/prisma.service';
import { CommonModule } from './shared/modules/common/common.module';
import { BaseQueryCoreModule } from './core/base-query-core/base-query-core.module';
import { VenueApiKeyCoreModule } from './core/venue-api-key-core/venue-api-key-core.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
    }),
    ThrottlerModule.forRoot([
      {
        limit: 1000,
        ttl: 60000, // 60 seconds in milliseconds
      },
    ]),
    CommonModule,
    BaseQueryCoreModule,
    VenueApiKeyCoreModule,
    AdminModule,
    VenueModule,
    VenueApiKeyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    PrismaService,
  ],
  exports: [PrismaService],
})
export class AppModule {}
