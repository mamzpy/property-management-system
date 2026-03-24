import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AxiosError } from 'axios';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  private readonly tenantServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.tenantServiceUrl =
      this.configService.get<string>('TENANT_SERVICE_URL') ||
      'http://localhost:3004'; // ✅ correct port
  }

  // ✅ Reusable error forwarder
  private async forwardRequest<T>(request: Promise<{ data: T }>): Promise<T> {
    try {
      const response = await request;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      if (axiosError.response) {
        throw new HttpException(
          axiosError.response.data,
          axiosError.response.status,
        );
      }
      throw new InternalServerErrorException('Tenant service unavailable');
    }
  }

  // 👥 GET ALL TENANTS
  @Get()
  async findAll(@Request() req): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.get(`${this.tenantServiceUrl}/tenants`, {
          headers: {
            'x-correlation-id': req.headers['x-correlation-id'],
            'Content-Type': 'application/json',
          },
        }),
      ),
    );
  }

  // 👥 GET TENANT BY ID
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.get(`${this.tenantServiceUrl}/tenants/${id}`, {
          headers: {
            'x-correlation-id': req.headers['x-correlation-id'],
            'Content-Type': 'application/json',
          },
        }),
      ),
    );
  }

  // 👥 CREATE TENANT
  @Post()
  async create(@Body() createTenantDto: any, @Request() req): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.post(
          `${this.tenantServiceUrl}/tenants`,
          createTenantDto,
          {
            headers: {
              'x-correlation-id': req.headers['x-correlation-id'],
              'Content-Type': 'application/json',
            },
          },
        ),
      ),
    );
  }

  // 👥 UPDATE TENANT
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: any,
    @Request() req,
  ): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.put(
          `${this.tenantServiceUrl}/tenants/${id}`,
          updateTenantDto,
          {
            headers: {
              'x-correlation-id': req.headers['x-correlation-id'],
              'Content-Type': 'application/json',
            },
          },
        ),
      ),
    );
  }

  // 👥 DELETE TENANT
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.delete(`${this.tenantServiceUrl}/tenants/${id}`, {
          headers: {
            'x-correlation-id': req.headers['x-correlation-id'],
            'Content-Type': 'application/json',
          },
        }),
      ),
    );
  }
}