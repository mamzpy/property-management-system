import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
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
    this.propertyServiceUrl =
      this.configService.get<string>('PROPERTY_SERVICE_URL') ||
      'http://localhost:3001';
  }

  @Get()
  async findAll(@Request() req): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.propertyServiceUrl}/properties`,
        {
          headers: {
            'x-correlation-id': req.headers['x-correlation-id'],
          },
        },
      ),
    );
    return response.data;
  }

  @Post()
  async create(
    @Body() createPropertyDto: any,
    @Request() req,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.propertyServiceUrl}/properties`,
        createPropertyDto,
        {
          headers: {
            'x-correlation-id': req.headers['x-correlation-id'],
          },
        },
      ),
    );
    return response.data;
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.propertyServiceUrl}/properties/${id}`,
        {
          headers: {
            'x-correlation-id': req.headers['x-correlation-id'],
          },
        },
      ),
    );
    return response.data;
  }
}
