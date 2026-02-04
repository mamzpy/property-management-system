import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { RedisLockService } from '../redis/redis-lock.service';
import { RabbitMQService } from '@shared/rabbitmq/rabbitmq.service';



@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

constructor(
  @InjectRepository(Booking)
  private readonly bookingRepository: Repository<Booking>,
  private readonly redisLockService: RedisLockService,
  private readonly rabbitMQService: RabbitMQService
) {}


  // ✅ CREATE BOOKING + booking.created
  async create(
    propertyId: number,
    tenantId: string,
    correlationId: string,
  ): Promise<Booking> {
    const booking = this.bookingRepository.create({
      propertyId,
      tenantId,
      status: BookingStatus.PENDING,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    this.logger.log(
      `[CID=${correlationId}] Booking created: ${savedBooking.id}`,
    );

    await this.rabbitMQService.publish(
      'booking',
      'booking.created',
      {
        bookingId: savedBooking.id,
        propertyId: savedBooking.propertyId,
        tenantId: savedBooking.tenantId,
        status: savedBooking.status,
        correlationId,
        occurredAt: new Date().toISOString(),
      },
    ); 

    return savedBooking;
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find();
  }

  async findPending(): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { status: BookingStatus.PENDING },
    });
  }

  async approve(
    id: string,
    adminId: string,
    correlationId: string,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOneBy({ id });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    booking.status = BookingStatus.APPROVED;
    booking.approvedAt = new Date();
    booking.approvedBy = adminId;

    const saved = await this.bookingRepository.save(booking);

    this.logger.log(
      `[CID=${correlationId}] Booking approved: ${saved.id}`,
    );

    await this.rabbitMQService.publish(
      'booking',
      'booking.approved',
      {
        bookingId: saved.id,
        tenantId: saved.tenantId,
        propertyId: saved.propertyId,
        approvedAt: saved.approvedAt,
        correlationId,
      },
    );

    return saved;
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
}
