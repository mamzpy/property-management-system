import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { BookingService } from '../../bookings/bookings.service';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { RedisLockService } from '../../redis/redis-lock.service';
import { OutboxService } from '../../outbox/outbox.service';

describe('BookingService - approve()', () => {
  let bookingService: BookingService;
  let bookingRepository: Repository<Booking>;
  let mockOutboxService: { savePendingEvent: jest.Mock };

  beforeEach(async () => {
    const mockRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
    };

    const mockManager = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };

    const mockDataSource = {
      transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(mockManager);
      }),
    };

    const mockRedisLockService = {
      acquireLock: jest.fn(),
      releaseLock: jest.fn(),
    };

    mockOutboxService = {
      savePendingEvent: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockRepository,
        },
        {
          provide: RedisLockService,
          useValue: mockRedisLockService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: OutboxService,
          useValue: mockOutboxService,
        },
      ],
    }).compile();

    bookingService = module.get<BookingService>(BookingService);
    bookingRepository = module.get<Repository<Booking>>(
      getRepositoryToken(Booking),
    );
  });

  it('should approve a booking and save booking.approved outbox event', async () => {
    const bookingId = '123';
    const adminId = 'admin-1';
    const correlationId = 'test-cid-123';

    const existingBooking: Booking = {
      id: bookingId,
      propertyId: 10,
      tenantId: 'tenant-100',
      status: BookingStatus.PENDING,
      approvedAt: undefined,
      approvedBy: undefined,
      rejectionReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const savedBooking: Booking = {
      ...existingBooking,
      status: BookingStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: adminId,
    };

    bookingRepository.findOneBy = jest.fn().mockResolvedValue(existingBooking);
    bookingRepository.save = jest.fn().mockResolvedValue(savedBooking);

    const result = await bookingService.approve(
      bookingId,
      adminId,
      correlationId,
    );

    expect(bookingRepository.findOneBy).toHaveBeenCalledWith({ id: bookingId });
    expect(bookingRepository.save).toHaveBeenCalled();

    expect(mockOutboxService.savePendingEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregateType: 'booking',
        aggregateId: bookingId,
        eventType: 'booking.approved',
        payload: expect.objectContaining({
          bookingId,
          tenantId: existingBooking.tenantId,
          propertyId: existingBooking.propertyId,
          approvedBy: adminId,
          correlationId,
        }),
      }),
      expect.anything(),
    );

    expect(result.status).toBe(BookingStatus.APPROVED);
    expect(result.approvedBy).toBe(adminId);
  });

  it('should throw NotFoundException when booking does not exist', async () => {
    const correlationId = 'test-cid-404';

    bookingRepository.findOneBy = jest.fn().mockResolvedValue(null);

    await expect(
      bookingService.approve('does-not-exist', 'admin', correlationId),
    ).rejects.toThrow(NotFoundException);
  });
});