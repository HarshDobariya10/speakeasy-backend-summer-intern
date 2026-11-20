import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiKeyType } from '@prisma/client';

import { VenueCoreService } from 'src/core/venue-core/venue-core.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { VenueMessages, VenueApiCredentialValidationErrors } from 'src/shared/keys/venue.keys';
import { BaseQueryCoreDto } from 'src/core/base-query-core/dto/base-query-core.dto';

@Injectable()
export class VenueService {
  constructor(private readonly venueCoreService: VenueCoreService) { }

  private validateApiCredentials(
    apiKeyType: ApiKeyType,
    apiKey: Record<string, any>,
  ) {
    switch (apiKeyType) {
      case ApiKeyType.BEARER_TOKEN:
        if (!apiKey?.token) {
          throw new BadRequestException(
            VenueApiCredentialValidationErrors.BEARER_TOKEN_REQUIRED,
          );
        }
        break;

      case ApiKeyType.BASIC_AUTH:
        if (!apiKey?.username || !apiKey?.password) {
          throw new BadRequestException(
            VenueApiCredentialValidationErrors.BASIC_AUTH_REQUIRED,
          );
        }
        break;

      case ApiKeyType.API_KEY:
        if (!apiKey?.apiKey) {
          throw new BadRequestException(
            VenueApiCredentialValidationErrors.API_KEY_REQUIRED,
          );
        }
        break;

      case ApiKeyType.OAUTH2_CLIENT_CREDENTIALS:
        if (
          !apiKey?.clientId ||
          !apiKey?.clientSecret ||
          !apiKey?.tokenUrl
        ) {
          throw new BadRequestException(
            VenueApiCredentialValidationErrors.OAUTH2_CLIENT_CREDENTIALS_REQUIRED,
          );
        }
        break;

      case ApiKeyType.OAUTH2_REFRESH_TOKEN:
        if (
          !apiKey?.clientId ||
          !apiKey?.clientSecret ||
          !apiKey?.refreshToken ||
          !apiKey?.tokenUrl
        ) {
          throw new BadRequestException(
            VenueApiCredentialValidationErrors.OAUTH2_REFRESH_TOKEN_REQUIRED,
          );
        }
        break;

      case ApiKeyType.JWT:
        if (!apiKey?.jwtToken) {
          throw new BadRequestException(
            VenueApiCredentialValidationErrors.JWT_REQUIRED,
          );
        }
        break;

      case ApiKeyType.CUSTOM_HEADERS:
        if (
          !apiKey?.headers ||
          typeof apiKey.headers !== 'object' ||
          Object.keys(apiKey.headers).length === 0
        ) {
          throw new BadRequestException(
            VenueApiCredentialValidationErrors.CUSTOM_HEADERS_REQUIRED,
          );
        }
        break;

      default:
        throw new BadRequestException(
          VenueApiCredentialValidationErrors.INVALID_API_KEY_TYPE,
        );
    }
  }

  async create(createVenueDto: CreateVenueDto) {
    // Check for duplicate venue name
    const existingVenue = await this.venueCoreService.findFirst({
      where: {
        venueName: createVenueDto.venueName,
        isDeleted: false,
      },
    });

    if (existingVenue) {
      throw new ConflictException(VenueMessages.DUPLICATE_NAME);
    }

    // Validate authentication credentials
    this.validateApiCredentials(
      createVenueDto.apiKeyType,
      createVenueDto.apiKey,
    );

    return this.venueCoreService.create({
      data: createVenueDto,
    });
  }

  async findAll(baseQueryCoreDto: BaseQueryCoreDto) {
    return this.venueCoreService.findPaginate(baseQueryCoreDto, {
      isDeleted: false,
    });
  }

  async findOne(id: string) {
    const venue = await this.venueCoreService.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!venue) {
      throw new NotFoundException(VenueMessages.NOT_FOUND);
    }

    return venue;
  }

  async update(id: string, updateVenueDto: UpdateVenueDto) {
    // Verify venue exists
    const existingVenue = await this.venueCoreService.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!existingVenue) {
      throw new NotFoundException(VenueMessages.NOT_FOUND);
    }

    // Check for duplicate venue name if updating name
    if (
      updateVenueDto.venueName &&
      updateVenueDto.venueName !== existingVenue.venueName
    ) {
      const duplicateVenue = await this.venueCoreService.findFirst({
        where: {
          venueName: updateVenueDto.venueName,
          isDeleted: false,
          id: {
            not: id,
          },
        },
      });

      if (duplicateVenue) {
        throw new ConflictException(VenueMessages.DUPLICATE_NAME);
      }
    }

    // Validate new credentials if provided
    if (updateVenueDto.apiKeyType && updateVenueDto.apiKey) {
      this.validateApiCredentials(
        updateVenueDto.apiKeyType,
        updateVenueDto.apiKey,
      );
    }

    return this.venueCoreService.update({
      where: { id },
      data: updateVenueDto,
    });
  }

  async remove(id: string) {
    const existingVenue = await this.venueCoreService.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!existingVenue) {
      throw new NotFoundException(VenueMessages.NOT_FOUND_OR_DELETED);
    }

    return this.venueCoreService.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }
}