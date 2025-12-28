import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller('tenants')
export class TenantsController {
  private readonly tenantServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.tenantServiceUrl =
      this.configService.get<string>('TENANT_SERVICE_URL') ||
      'http://localhost:3002';
  }

  @Get()
  async findAll(@Request() req): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.tenantServiceUrl}/tenants`,
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
    @Body() createTenantDto: any,
    @Request() req,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.tenantServiceUrl}/tenants`,
        createTenantDto,
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
        `${this.tenantServiceUrl}/tenants/${id}`,
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
