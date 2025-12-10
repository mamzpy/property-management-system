import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class BookingService {
  private readonly tenantServiceUrl: string;

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private readonly httpService: HttpService, // 👈 added
  ) {
    this.tenantServiceUrl =
      process.env.TENANT_SERVICE_URL || 'http://tenant-service:3002';
  }

  async create(propertyId: number, tenantId: string): Promise<Booking> {
    const booking = this.bookingRepository.create({
      propertyId,
      tenantId,
      status: BookingStatus.PENDING,
    });

    return this.bookingRepository.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find();
  }

  async findPending(): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { status: BookingStatus.PENDING },
    });
  }

  async approve(id: string, adminId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOneBy({ id });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    booking.status = BookingStatus.APPROVED;
    booking.approvedAt = new Date();
    booking.approvedBy = adminId;

    const saved = await this.bookingRepository.save(booking);

    try {
      await this.httpService.axiosRef.post(
        `${this.tenantServiceUrl}/tenants`,
        {
          userId: saved.tenantId,
          propertyId: saved.propertyId,
          status: 'active',
        },
      );
      console.log(`Tenant created for user ${saved.tenantId}`);
    } catch (err) {
      console.error(
        `Failed to create tenant for booking ${saved.id}`,
        err?.message || err,
      );
    }

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
