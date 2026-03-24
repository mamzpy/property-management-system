import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Booking, BookingStatus } from '../entities/booking.entity';
import { RedisLockService } from '../redis/redis-lock.service';
import { OutboxService } from '../outbox/outbox.service';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly redisLockService: RedisLockService,
    private readonly dataSource: DataSource,
    private readonly outboxService: OutboxService,
  ) {}

  async create(
    propertyId: number,
    tenantId: string,
    correlationId: string,
  ): Promise<Booking> {
    return this.dataSource.transaction(async (manager) => {
      const bookingRepo = manager.getRepository(Booking);

      const booking = bookingRepo.create({
        propertyId,
        tenantId,
        status: BookingStatus.PENDING,
      });

      const savedBooking = await bookingRepo.save(booking);

      this.logger.log(
        `[CID=${correlationId}] Booking created: ${savedBooking.id}`,
      );

      // 🔥 Outbox event inside SAME transaction
      await this.outboxService.savePendingEvent(
        {
          aggregateType: 'booking',
          aggregateId: savedBooking.id,
          eventType: 'booking.created',
          payload: {
            bookingId: savedBooking.id,
            propertyId: savedBooking.propertyId,
            tenantId: savedBooking.tenantId,
            status: savedBooking.status,
            correlationId,
            occurredAt: new Date().toISOString(),
          },
        },
        manager,
      );

      return savedBooking;
    });
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find();
  }

  async findPending(): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { status: BookingStatus.PENDING },
    });
  }

  // ✅ APPROVE BOOKING + OUTBOX booking.approved (same DB transaction)
  async approve(
    id: string,
    adminId: string,
    correlationId: string,
  ): Promise<Booking> {
    return this.dataSource.transaction(async (manager) => {
      const bookingRepo = manager.getRepository(Booking);

      const booking = await bookingRepo.findOneBy({ id });
      if (!booking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      booking.status = BookingStatus.APPROVED;
      booking.approvedAt = new Date();
      booking.approvedBy = adminId;

      const saved = await bookingRepo.save(booking);

      this.logger.log(
        `[CID=${correlationId}] Booking approved: ${saved.id}`,
      );

      await this.outboxService.savePendingEvent(
        {
          aggregateType: 'booking',
          aggregateId: saved.id,
          eventType: 'booking.approved',
          payload: {
            bookingId: saved.id,
            tenantId: saved.tenantId,
            propertyId: saved.propertyId,
            approvedAt: saved.approvedAt,
            approvedBy: saved.approvedBy,
            correlationId,
            occurredAt: new Date().toISOString(),
          },
        },
        manager,
      );

      return saved;
    });
  }

  async reject(id: string, reason?: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOneBy({ id });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    booking.status = BookingStatus.REJECTED;
    booking.rejectionReason = reason || null;

    return this.bookingRepository.save(booking);
  }
  async resetAll(): Promise<void> {
    await this.bookingRepository.query(`TRUNCATE TABLE bookings RESTART IDENTITY CASCADE`);
    this.logger.log("Demo reset — all bookings cleared");
  }
}