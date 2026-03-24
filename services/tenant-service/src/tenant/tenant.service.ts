import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnModuleInit } from '@nestjs/common';
import { Tenant } from 'src/entities/tenant.entity';
import { RabbitMQService } from '@pms/shared/rabbitmq/rabbitmq.service';

@Injectable()
export class TenantService implements OnModuleInit {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.subscribe(
      'booking',
      'booking.created',
      'tenant-service.booking-created',
      async (payload) => {
        const { bookingId, tenantId, propertyId, correlationId } = payload;
        this.logger.log(
          `[CID=${correlationId}] Received booking.created | bookingId=${bookingId} tenantId=${tenantId} propertyId=${propertyId}`,
        );

        const existingTenant = await this.tenantRepository.findOne({
          where: { userId: tenantId, propertyId: String(propertyId) },
        });

        if (existingTenant) {
          this.logger.warn(
            `[CID=${correlationId}] Duplicate booking.created ignored | bookingId=${bookingId}`,
          );
          return;
        }

        await this.tenantRepository.save({
          userId: tenantId,
          propertyId: String(propertyId),
          status: 'ACTIVE',
        });

        this.logger.log(
          `[CID=${correlationId}] Tenant activated from booking ${bookingId}`,
        );
      },
    );
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  // ✅ query by userId (UUID), not DB integer id
  async findOne(userId: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { userId },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with userId ${userId} not found`);
    }
    return tenant;
  }

  async create(tenantData: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenantRepository.create(tenantData);
    return this.tenantRepository.save(tenant);
  }

  async update(userId: string, tenantData: Partial<Tenant>): Promise<Tenant> {
    await this.tenantRepository.update({ userId }, tenantData);
    return this.findOne(userId);
  }

  async remove(userId: string): Promise<void> {
    await this.tenantRepository.delete({ userId });
  }
  async resetAll(): Promise<void> {
    await this.tenantRepository.query(`TRUNCATE TABLE tenants RESTART IDENTITY CASCADE`);
    this.logger.log("Demo reset — all tenants cleared");
  }
}
