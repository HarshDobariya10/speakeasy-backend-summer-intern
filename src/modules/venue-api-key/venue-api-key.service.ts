import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiKeyExpiration } from '@prisma/client';
import { VenueApiKeyCoreService } from 'src/core/venue-api-key-core/venue-api-key-core.service';
import { VenueCoreService } from 'src/core/venue-core/venue-core.service';
import { generateSecureApiKey } from 'src/shared/libs/api-key-generator.helper';
import { VenueApiKeyMessages, VenueApiKeyValidationErrors } from 'src/shared/keys/venue-api-key.keys';
import { CreateVenueApiKeyDto } from './dto/create-venue-api-key.dto';
import { UpdateVenueApiKeyDto } from './dto/update-venue-api-key.dto';

@Injectable()
export class VenueApiKeyService {
  constructor(
    private readonly venueApiKeyCoreService: VenueApiKeyCoreService,
    private readonly venueCoreService: VenueCoreService,
  ) {}

  private calculateExpiresAt(expiryOption: ApiKeyExpiration): Date | null {
    const now = new Date();
    const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
    
    switch (expiryOption) {
      case ApiKeyExpiration.NO_EXPIRE:
        return null;
      case ApiKeyExpiration.ONE_DAY:
        return new Date(now.getTime() + MILLISECONDS_PER_DAY);
      case ApiKeyExpiration.ONE_WEEK:
        return new Date(now.getTime() + 7 * MILLISECONDS_PER_DAY);
      case ApiKeyExpiration.ONE_MONTH:
        return new Date(now.getTime() + 30 * MILLISECONDS_PER_DAY);
      default:
        throw new BadRequestException(VenueApiKeyValidationErrors.INVALID_EXPIRY);
    }
  }

  private isApiKeyExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) return false;
    return new Date() > expiresAt;
  }

  async create(createVenueApiKeyDto: CreateVenueApiKeyDto) {
    // Verify venue exists
    const venue = await this.venueCoreService.findUnique({
      where: { id: createVenueApiKeyDto.venueId, isDeleted: false },
    });

    if (!venue) {
      throw new NotFoundException(VenueApiKeyValidationErrors.VENUE_NOT_FOUND);
    }

    const apiKey = generateSecureApiKey();
    const expiresAt = this.calculateExpiresAt(createVenueApiKeyDto.expiryOption);
    
    return this.venueApiKeyCoreService.create({
      data: {
        name: createVenueApiKeyDto.name,
        apiKey,
        venueId: createVenueApiKeyDto.venueId,
        expiryOption: createVenueApiKeyDto.expiryOption,
        expiresAt,
      },
    });
  }

  async findAll(venueId: string) {
    return this.venueApiKeyCoreService.findMany({
      where: { venueId, isDeleted: false },
    });
  }

  async findOne(id: string) {
    const apiKey = await this.venueApiKeyCoreService.findUnique({
      where: { id, isDeleted: false },
    });

    if (!apiKey || apiKey.isDeleted) {
      throw new NotFoundException(VenueApiKeyMessages.NOT_FOUND_OR_DELETED);
    }

    // Check if API key has expired
    if (this.isApiKeyExpired(apiKey.expiresAt)) {
      throw new BadRequestException(VenueApiKeyMessages.EXPIRED);
    }

    return apiKey;
  }

  async update(id: string, updateVenueApiKeyDto: UpdateVenueApiKeyDto) {
    // Verify API key exists
    const existingApiKey = await this.venueApiKeyCoreService.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existingApiKey || existingApiKey.isDeleted) {
      throw new NotFoundException(VenueApiKeyMessages.NOT_FOUND_OR_DELETED);
    }

    const expiresAt = updateVenueApiKeyDto.expiryOption
      ? this.calculateExpiresAt(updateVenueApiKeyDto.expiryOption)
      : undefined;

    return this.venueApiKeyCoreService.update({
      where: { id },
      data: {
        ...(updateVenueApiKeyDto.name && { name: updateVenueApiKeyDto.name }),
        ...(updateVenueApiKeyDto.expiryOption && { expiryOption: updateVenueApiKeyDto.expiryOption }),
        ...(expiresAt !== undefined && { expiresAt }),
      },
    });
  }

  async remove(id: string) {
    // Verify API key exists
    const existingApiKey = await this.venueApiKeyCoreService.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existingApiKey || existingApiKey.isDeleted) {
      throw new NotFoundException(VenueApiKeyMessages.NOT_FOUND_OR_DELETED);
    }

    return this.venueApiKeyCoreService.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
