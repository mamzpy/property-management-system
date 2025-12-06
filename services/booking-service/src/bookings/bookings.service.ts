import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from '../entities/booking.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  /**
   * TENANT creates a booking request
   */
  async create(propertyId: number, tenantId: string): Promise<Booking> {
    const booking = this.bookingRepository.create({
      propertyId,
      tenantId,
      status: BookingStatus.PENDING,
    });

    return this.bookingRepository.save(booking);
  }

  /**
   * ADMIN views all bookings
   */
  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find();
  }

  /**
   * ADMIN sees pending requests
   */
  async findPending(): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { status: BookingStatus.PENDING },
    });
  }

  /**
   * ADMIN approves booking
   */
  async approve(id: string, adminId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOneBy({ id });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    booking.status = BookingStatus.APPROVED;
    booking.approvedAt = new Date();
    booking.approvedBy = adminId;

    return this.bookingRepository.save(booking);
  }

  /**
   * ADMIN rejects booking
   */
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
