import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { BookingService } from '../../bookings/bookings.service';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { RedisLockService } from '../../redis/redis-lock.service';
import { OutboxService } from '../../outbox/outbox.service';

describe('BookingService - create()', () => {
  let bookingService: BookingService;
  let bookingRepository: Repository<Booking>;
  let mockOutboxService: { savePendingEvent: jest.Mock };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
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

  it('should create and save a new booking', async () => {
    const propertyId = 1;
    const tenantId = 'abc-123';
    const correlationId = 'test-cid-123';

    const mockBooking: Partial<Booking> = {
      id: 'uuid',
      propertyId,
      tenantId,
      status: BookingStatus.PENDING,
    };

    bookingRepository.create = jest.fn().mockReturnValue(mockBooking);
    bookingRepository.save = jest.fn().mockResolvedValue(mockBooking);

    const result = await bookingService.create(
      propertyId,
      tenantId,
      correlationId,
    );

    expect(bookingRepository.create).toHaveBeenCalledWith({
      propertyId,
      tenantId,
      status: BookingStatus.PENDING,
    });

    expect(bookingRepository.save).toHaveBeenCalledWith(mockBooking);

    expect(mockOutboxService.savePendingEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregateType: 'booking',
        aggregateId: 'uuid',
        eventType: 'booking.created',
        payload: expect.objectContaining({
          bookingId: 'uuid',
          propertyId,
          tenantId,
          status: BookingStatus.PENDING,
          correlationId,
        }),
      }),
      expect.anything(),
    );

    expect(result).toEqual(mockBooking);
  });
});