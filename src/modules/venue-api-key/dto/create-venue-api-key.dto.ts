import { IsString, IsEnum, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiKeyExpiration } from '@prisma/client';

export class CreateVenueApiKeyDto {
  @ApiProperty({ description: 'API Key name' })
  @IsString()
  @IsNotEmpty({ message: 'API Key name is required' })
  name: string;

  @ApiProperty({ description: 'Venue ID' })
  @IsUUID()
  @IsNotEmpty({ message: 'Venue ID is required' })
  venueId: string;

  @ApiProperty({
    description: 'Expiration option',
    enum: ApiKeyExpiration,
    default: ApiKeyExpiration.NO_EXPIRE,
  })
  @IsEnum(ApiKeyExpiration)
  expiryOption: ApiKeyExpiration = ApiKeyExpiration.NO_EXPIRE;
}
