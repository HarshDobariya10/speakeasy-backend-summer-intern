import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';

import { VenueApiKeyService } from './venue-api-key.service';
import { CreateVenueApiKeyDto } from './dto/create-venue-api-key.dto';
import { UpdateVenueApiKeyDto } from './dto/update-venue-api-key.dto';

@ApiTags('Venue API Keys')
@Controller('admin/venue-api-keys')
@ApiBearerAuth()
export class VenueApiKeyController {
  constructor(private readonly venueApiKeyService: VenueApiKeyService) {}

  @Post()
  @ApiOperation({
    summary: 'Generate and create a new API key',
    description: 'Creates a new API key with an auto-generated secure token (spk_ prefix). Returns the generated API key.',
  })
  create(@Body() createVenueApiKeyDto: CreateVenueApiKeyDto) {
    return this.venueApiKeyService.create(createVenueApiKeyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all API keys for a venue' })
  findAll(@Query('venueId') venueId: string) {
    return this.venueApiKeyService.findAll(venueId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get API key by ID' })
  findOne(@Param('id') id: string) {
    return this.venueApiKeyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update API key' })
  update(
    @Param('id') id: string,
    @Body() updateVenueApiKeyDto: UpdateVenueApiKeyDto,
  ) {
    return this.venueApiKeyService.update(id, updateVenueApiKeyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete API key' })
  remove(@Param('id') id: string) {
    return this.venueApiKeyService.remove(id);
  }
}
