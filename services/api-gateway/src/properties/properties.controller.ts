import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller('properties')
export class PropertiesController {
  private readonly propertyServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
this.propertyServiceUrl = this.configService.get<string>('PROPERTY_SERVICE_URL') || 'http://localhost:3001';
  }

  @Get()
  async findAll(): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.propertyServiceUrl}/properties`)
    );
    return response.data;
  }

  @Post()
  async create(@Body() createPropertyDto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(`${this.propertyServiceUrl}/properties`, createPropertyDto)
    );
    return response.data;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.propertyServiceUrl}/properties/${id}`)
    );
    return response.data;
  }
}