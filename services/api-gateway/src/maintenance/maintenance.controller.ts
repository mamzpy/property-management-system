import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller('maintenance')
export class MaintenanceController {
  private readonly maintenanceServiceUrl: string;

  

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
this.maintenanceServiceUrl = this.configService.get<string>('MAINTENANCE_SERVICE_URL') || 'http://localhost:3003';
  }

  @Get()
  async findAll(): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.maintenanceServiceUrl}/maintenance`)
    );
    return response.data;
  }

  @Post()
  async create(@Body() createMaintenanceDto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(`${this.maintenanceServiceUrl}/maintenance`, createMaintenanceDto)
    );
    return response.data;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.maintenanceServiceUrl}/maintenance/${id}`)
    );
    return response.data;
  }
}