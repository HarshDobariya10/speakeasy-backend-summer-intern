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
  ApiParam,
} from '@nestjs/swagger';

import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { BaseQueryCoreDto } from 'src/core/base-query-core/dto/base-query-core.dto';

@ApiTags('Venues')
@Controller('admin/venues')
@ApiBearerAuth()
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new venue' })
  async create(@Body() createVenueDto: CreateVenueDto) {
    return this.venueService.create(createVenueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all venues with pagination' })
  async findAll(@Query() baseQueryCoreDto: BaseQueryCoreDto) {
    return this.venueService.findAll(baseQueryCoreDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a venue by ID' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  async findOne(@Param('id') id: string) {
    return this.venueService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a venue by ID' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  async update(
    @Param('id') id: string,
    @Body() updateVenueDto: UpdateVenueDto,
  ) {
    return this.venueService.update(id, updateVenueDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a venue by ID' })
  @ApiParam({ name: 'id', description: 'Venue ID (UUID)' })
  async remove(@Param('id') id: string) {
    return this.venueService.remove(id);
  }
}
