import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Tenant } from 'entities/tenant.entity';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

    @Get('health') // This will be accessible at /maintenance/health
  getHealth() {
    return { status: 'ok', service: 'tenants-service' };
  }


  @Get()
  async findAll(): Promise<Tenant[]> {
    return this.tenantService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Tenant> {
    return this.tenantService.findOne(id);
  }

  @Post()
  async create(@Body() tenantData: Partial<Tenant>): Promise<Tenant> {
    return this.tenantService.create(tenantData);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() tenantData: Partial<Tenant>,
  ): Promise<Tenant> {
    return this.tenantService.update(id, tenantData);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.tenantService.remove(id);
  }
}