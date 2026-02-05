import { Test, TestingModule } from '@nestjs/testing';
import { PropertyService } from '../property.service';
import { Property } from '../../entities/property.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RabbitMQService } from '@shared/rabbitmq/rabbitmq.service';

describe('PropertyService - create()', () => {
  let propertyService: PropertyService;
  let propertyRepository: Repository<Property>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        {
          provide: getRepositoryToken(Property),
          useValue: mockRepository,
        },
        {
         provide: RabbitMQService,
           useValue: { publish: jest.fn().mockResolvedValue(undefined) },
    },
  
      ],
    }).compile();

    propertyService = module.get<PropertyService>(PropertyService);
    propertyRepository = module.get(getRepositoryToken(Property));
  });

  it('should create and save a property', async () => {
    const data = {
      address: '123 Main St',
      city: 'Torino',
      state: 'Italy',
      zipCode: '10100',
      rentAmount: 1200,
      bedrooms: 2,
      bathrooms: 1,
      description: 'Test property',
    };

    const mockProperty = { id: 1, ...data };

    propertyRepository.create = jest.fn().mockReturnValue(mockProperty);
    propertyRepository.save = jest.fn().mockResolvedValue(mockProperty);

    const result = await propertyService.create(data);

    expect(propertyRepository.create).toHaveBeenCalledWith(data);
    expect(propertyRepository.save).toHaveBeenCalledWith(mockProperty);
    expect(result).toEqual(mockProperty);
  });
});
