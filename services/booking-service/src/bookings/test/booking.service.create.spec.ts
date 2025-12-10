import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from '../../bookings/bookings.service';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';

describe('BookingService - create()', () => {
  let bookingService: BookingService;
  let bookingRepository: Repository<Booking>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
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
  });

  it('should create and save a new booking', async () => {
    const propertyId = 1;
    const tenantId = 'abc-123';

    const mockBooking = {
      id: 'uuid',
      propertyId,
      tenantId,
      status: BookingStatus.PENDING,
    };

    bookingRepository.create = jest.fn().mockReturnValue(mockBooking);
    bookingRepository.save = jest.fn().mockResolvedValue(mockBooking);

    const result = await bookingService.create(propertyId, tenantId);

    expect(bookingRepository.create).toHaveBeenCalledWith({
      propertyId,
      tenantId,
      status: BookingStatus.PENDING,
    });

    expect(bookingRepository.save).toHaveBeenCalledWith(mockBooking);

    expect(result).toEqual(mockBooking);
  });
});
