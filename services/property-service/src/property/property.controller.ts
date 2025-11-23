import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PropertyService } from './property.service';
import { Property } from '../entities/property.entity';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

    @Get('health') // This will be accessible at /maintenance/health
  getHealth() {
    return { status: 'ok', service: 'property-service' };
  }


  @Get()
  async findAll(): Promise<Property[]> {
    return this.propertyService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Property> {
    return this.propertyService.findOne(id);
  }

  @Post()
  async create(@Body() propertyData: Partial<Property>): Promise<Property> {
    return this.propertyService.create(propertyData);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() propertyData: Partial<Property>,
  ): Promise<Property> {
    return this.propertyService.update(id, propertyData);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.propertyService.remove(id);
  }
}