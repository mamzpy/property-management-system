import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from 'src/entities/tenant.entity';
import { RabbitMQService } from '@shared/rabbitmq/rabbitmq.service';

@Injectable()
export class TenantService implements OnModuleInit {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  // ✅ Subscribe to booking.created
  async onModuleInit() {
    await this.rabbitMQService.subscribe(
      'booking',
      'booking.created',
      'tenant-service.booking-created',
      async (payload) => {
        const { bookingId, tenantId, propertyId, correlationId } = payload;

        this.logger.log(
          `[CID=${correlationId}] Received booking.created | bookingId=${bookingId}`,
        );

        const existingTenant = await this.tenantRepository.findOne({
          where: { userId: tenantId, propertyId },
        });

        // ✅ Idempotency
        if (existingTenant) {
          this.logger.warn(
            `[CID=${correlationId}] Duplicate booking.created ignored | bookingId=${bookingId}`,
          );
          return;
        }

        await this.tenantRepository.save({
          userId: tenantId,
          propertyId,
          status: 'ACTIVE',
          bookingId,
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

  async findOne(id: number): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async create(tenantData: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenantRepository.create(tenantData);
    return this.tenantRepository.save(tenant);
  }

  async update(id: number, tenantData: Partial<Tenant>): Promise<Tenant> {
    await this.tenantRepository.update(id, tenantData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.tenantRepository.delete(id);
  }
}
