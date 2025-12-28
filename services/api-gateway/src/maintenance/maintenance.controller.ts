import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
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
    this.maintenanceServiceUrl =
      this.configService.get<string>('MAINTENANCE_SERVICE_URL') ||
      'http://localhost:3003';
  }

  @Get()
  async findAll(@Request() req): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.maintenanceServiceUrl}/maintenance`,
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
    @Body() createMaintenanceDto: any,
    @Request() req,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.maintenanceServiceUrl}/maintenance`,
        createMaintenanceDto,
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
        `${this.maintenanceServiceUrl}/maintenance/${id}`,
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
