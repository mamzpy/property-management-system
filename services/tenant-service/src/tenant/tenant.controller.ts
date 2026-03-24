import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Tenant } from 'src/entities/tenant.entity';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'tenants-service' };
  }

  @Get()
  async findAll(): Promise<Tenant[]> {
    return this.tenantService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Tenant> {
    return this.tenantService.findOne(id);
  }

  @Post()
  async create(@Body() tenantData: Partial<Tenant>): Promise<Tenant> {
    return this.tenantService.create(tenantData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() tenantData: Partial<Tenant>,
  ): Promise<Tenant> {
    return this.tenantService.update(id, tenantData);
  }

  @Delete('reset/all')
  async resetAll(): Promise<{ message: string }> {
    await this.tenantService.resetAll();
    return { message: 'All tenants cleared' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.tenantService.remove(id);
  }
}
