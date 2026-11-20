import { Module } from '@nestjs/common';
import { VenueApiKeyService } from './venue-api-key.service';
import { VenueApiKeyController } from './venue-api-key.controller';
import { VenueApiKeyCoreModule } from 'src/core/venue-api-key-core/venue-api-key-core.module';
import { VenueCoreModule } from 'src/core/venue-core/venue-core.module';

@Module({
  imports: [VenueApiKeyCoreModule, VenueCoreModule],
  controllers: [VenueApiKeyController],
  providers: [VenueApiKeyService],
  exports: [VenueApiKeyService],
})
export class VenueApiKeyModule {}
