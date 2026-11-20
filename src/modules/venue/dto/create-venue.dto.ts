import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty, IsObject, MinLength, MaxLength, ValidateIf } from 'class-validator';
import { PosProvider, ApiKeyType } from '@prisma/client';

export class CreateVenueDto {
  @ApiProperty({
    description: 'Name of the venue',
    example: 'Downtown Restaurant',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Venue name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Venue name cannot exceed 255 characters' })
  venueName: string;

  @ApiProperty({
    description: 'POS provider for the venue',
    enum: PosProvider,
  })
  @IsEnum(PosProvider)
  posProvider: PosProvider;

  @ApiProperty({
    description: 'Authentication type',
    enum: ApiKeyType,
  })
  @IsEnum(ApiKeyType)
  apiKeyType: ApiKeyType;

  @ApiProperty({
    description: 'Authentication credentials based on selected apiKeyType',
    example: {
      token: 'abc123',
    },
  })
  @IsObject()
  @IsNotEmpty({ message: 'Authentication credentials are required' })
  apiKey: Record<string, any>;
}