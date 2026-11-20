import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiKeyExpiration } from '@prisma/client';

export class UpdateVenueApiKeyDto {
  @ApiProperty({ description: 'API Key name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Expiration option',
    enum: ApiKeyExpiration,
    required: false,
  })
  @IsOptional()
  @IsEnum(ApiKeyExpiration)
  expiryOption?: ApiKeyExpiration;
}
