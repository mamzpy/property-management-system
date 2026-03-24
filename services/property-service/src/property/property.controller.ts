import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PropertyService } from './property.service';
import { Property } from '../entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('properties')
@ApiBearerAuth()
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'property-service' };
  }

  @Get()
  findAll(): Promise<Property[]> {
    return this.propertyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Property> {
    return this.propertyService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePropertyDto): Promise<Property> {
    return this.propertyService.create(dto);
  }

  @Post('internal/reset')
  async resetDemo(): Promise<{ message: string }> {
    await this.propertyService.resetForDemo();
    return { message: 'Properties reset to available' };
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePropertyDto,
  ): Promise<Property> {
    return this.propertyService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.propertyService.remove(id);
  }
}
