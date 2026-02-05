import { Injectable, OnModuleInit, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';
import { RabbitMQService } from '@shared/rabbitmq/rabbitmq.service';

@Injectable()
export class PropertyService implements OnModuleInit {
  private readonly logger = new Logger(PropertyService.name);

  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.subscribe(
      'booking',
      'booking.approved',
      'property-service.booking-approved',
      async (payload) => {
        const { bookingId, propertyId, correlationId } = payload;

        this.logger.log(
          `[CID=${correlationId}] Received booking.approved | bookingId=${bookingId}`,
        );

        const property = await this.propertyRepository.findOne({
          where: { id: propertyId },
        });

        if (!property) {
          this.logger.warn(
            `[CID=${correlationId}] Property ${propertyId} not found`,
          );
          return;
        }

        if (property.status === 'UNAVAILABLE') {
          this.logger.warn(
            `[CID=${correlationId}] Property ${propertyId} already UNAVAILABLE`,
          );
          return;
        }

        property.status = 'UNAVAILABLE';
        await this.propertyRepository.save(property);

        this.logger.log(
          `[CID=${correlationId}] Property ${propertyId} marked UNAVAILABLE due to booking ${bookingId}`,
        );
      },
    );
  }

  async findAll(): Promise<Property[]> {
    return this.propertyRepository.find();
  }

 async findOne(id: number): Promise<Property> {
  const property = await this.propertyRepository.findOneBy({ id });

  if (!property) {
    throw new NotFoundException(`Property with ID ${id} not found`);
  }

  return property;
}
 async create(data: Partial<Property>, correlationId = 'property-create-no-cid') {
    const entity = this.propertyRepository.create(data);
    const saved = await this.propertyRepository.save(entity);

    await this.rabbitMQService.publish('property', 'property.created', {
      propertyId: saved.id,
      correlationId,
      occurredAt: new Date().toISOString(),
    });

    return saved;
  }
}
