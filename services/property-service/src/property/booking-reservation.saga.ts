import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RabbitMQService } from '@pms/shared/rabbitmq/rabbitmq.service';
import { Property } from 'src/entities/property.entity';

type BookingCreatedPayload = {
  bookingId: string;
  propertyId: number;
  tenantId: string;
  status: string;
  correlationId?: string;
};

@Injectable()
export class BookingReservationSaga implements OnModuleInit {
  private readonly logger = new Logger(BookingReservationSaga.name);

  constructor(
    private readonly rabbit: RabbitMQService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    // In a real system you might guard tests here too, but for now we keep it active.
    await this.rabbit.subscribe(
      'booking',              // exchange
      'booking.created',      // routing key
      'property.booking.created', // queue name
      (payload) => this.handleBookingCreated(payload),
      {
        maxRetries: 5,
        retryDelayMs: 5000,
        prefetch: 5,
      },
    );

    this.logger.log('Subscribed to booking.created for property reservations');
  }

  private async handleBookingCreated(payload: BookingCreatedPayload) {
    const { bookingId, propertyId, tenantId, correlationId } = payload;
    this.logger.log(
      `[CID=${correlationId ?? 'n/a'}] Handling booking.created for booking=${bookingId}, property=${propertyId}`,
    );

    await this.dataSource.transaction(async (manager) => {
      const propertyRepo = manager.getRepository(Property);

      const property = await propertyRepo.findOne({
        where: { id: propertyId },
      });

      if (!property) {
        this.logger.warn(
          `[CID=${correlationId ?? 'n/a'}] Property ${propertyId} not found for booking ${bookingId}`,
        );

        await this.rabbit.publish(
          'booking',
          'property.reservation_failed',
          {
            bookingId,
            propertyId,
            tenantId,
            reason: 'PROPERTY_NOT_FOUND',
            correlationId,
            occurredAt: new Date().toISOString(),
          },
        );

        return;
      }

      // here adapt to your real schema
      // e.g. property.isAvailable, property.status, property.availableUnits, etc.
      const isAvailable =
        (property as any).isAvailable ?? (property as any).status !== 'unavailable';

      if (!isAvailable) {
        this.logger.warn(
          `[CID=${correlationId ?? 'n/a'}] Property ${propertyId} not available for booking ${bookingId}`,
        );


        await this.rabbit.publish(
          'booking',
          'property.reservation_failed',
          {
            bookingId,
            propertyId,
            tenantId,
            reason: 'PROPERTY_NOT_AVAILABLE',
            correlationId,
            occurredAt: new Date().toISOString(),
          },
        );

        return;
      }

      // Mark reserved / unavailable – adjust to your entity fields
      if ('isAvailable' in property) {
        (property as any).isAvailable = false;
      } else if ('status' in property) {
        (property as any).status = 'unavailable';
      }

      await propertyRepo.save(property);

      this.logger.log(
        `[CID=${correlationId ?? 'n/a'}] Property ${propertyId} reserved for booking ${bookingId}`,
      );

      await this.rabbit.publish(
        'booking',
        'property.reserved',
        {
          bookingId,
          propertyId,
          tenantId,
          correlationId,
          occurredAt: new Date().toISOString(),
        },
      );
    });
  }
}