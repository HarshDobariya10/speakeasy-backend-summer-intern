import { ApiProperty } from '@nestjs/swagger';
import { VenueApiKey } from '@prisma/client';
import { IsArray } from 'class-validator';
import { CorePaginateDto } from 'src/core/base-query-core/dto/base-query-core.dto';

export class VenueApiKeyCoreDto extends CorePaginateDto {
  @ApiProperty({ required: true })
  @IsArray()
  list?: VenueApiKey[];
}
