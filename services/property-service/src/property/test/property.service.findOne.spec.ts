import { Test, TestingModule } from '@nestjs/testing';
import { PropertyService } from '../property.service';
import { Property } from '../../entities/property.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('PropertyService - findOne()', () => {
  let propertyService: PropertyService;
  let propertyRepository: Repository<Property>;

  beforeEach(async () => {
    const mockRepository = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        {
          provide: getRepositoryToken(Property),
          useValue: mockRepository,
        },
      ],
    }).compile();

    propertyService = module.get<PropertyService>(PropertyService);
    propertyRepository = module.get(getRepositoryToken(Property));
  });

  it('should return property when found', async () => {
    const mockProperty = {
      id: 1,
      address: 'Somewhere',
      city: 'Torino',
    } as Property;

    propertyRepository.findOneBy = jest
      .fn()
      .mockResolvedValue(mockProperty);

    const result = await propertyService.findOne(1);

    expect(propertyRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(mockProperty);
  });

  it('should throw NotFoundException when property not found', async () => {
    propertyRepository.findOneBy = jest.fn().mockResolvedValue(null);

    await expect(propertyService.findOne(999)).rejects.toThrow(
      NotFoundException,
    );
  });
});
