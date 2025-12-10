import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from '../../bookings/bookings.service';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { NotFoundException } from '@nestjs/common';

describe('BookingService - approve()', () => {
  let bookingService: BookingService;
  let bookingRepository: Repository<Booking>;
  let httpService: HttpService;

  beforeEach(async () => {
    const mockRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
    };

    const mockHttpService = {
      axiosRef: {
        post: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    bookingService = module.get<BookingService>(BookingService);
    bookingRepository = module.get(getRepositoryToken(Booking));
    httpService = module.get<HttpService>(HttpService);
  });

  it('should approve a booking and call tenant-service', async () => {
    // GIVEN
    const bookingId = '123';
    const adminId = 'admin-1';

    const existingBooking: Booking = {
      id: bookingId,
      propertyId: 10,
      tenantId: 'tenant-100',
      status: BookingStatus.PENDING,
      approvedAt: null,
      approvedBy: null,
      rejectionReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    bookingRepository.findOneBy = jest.fn().mockResolvedValue(existingBooking);
    bookingRepository.save = jest.fn().mockResolvedValue({
      ...existingBooking,
      status: BookingStatus.APPROVED,
    });
    httpService.axiosRef.post = jest.fn().mockResolvedValue({});

    // WHEN
    const result = await bookingService.approve(bookingId, adminId);

    // THEN
    expect(bookingRepository.findOneBy).toHaveBeenCalledWith({ id: bookingId });

    expect(bookingRepository.save).toHaveBeenCalled();

    expect(result.status).toBe(BookingStatus.APPROVED);

    expect(httpService.axiosRef.post).toHaveBeenCalledWith(
      `${bookingService['tenantServiceUrl']}/tenants`,
      {
        userId: existingBooking.tenantId,
        propertyId: existingBooking.propertyId,
        status: 'active',
      },
    );
  });

  it('should throw NotFoundException when booking does not exist', async () => {
    bookingRepository.findOneBy = jest.fn().mockResolvedValue(null);

    await expect(bookingService.approve('does-not-exist', 'admin'))
      .rejects
      .toThrow(NotFoundException);
  });
});
