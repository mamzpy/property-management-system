import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';


@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async findAll(): Promise<Property[]> {
    return this.propertyRepository.find();
  }

  async findOne(id: number): Promise<Property> {
    const entity = await this.propertyRepository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return entity;
  }

  async create(data: Partial<Property>): Promise<Property> {
    const entity = this.propertyRepository.create(data);
    return this.propertyRepository.save(entity);
  }

async update(id: number, dto: Partial<Property>) {
  const entity = await this.propertyRepository.preload({ id, ...dto });
  if (!entity) {
    throw new NotFoundException(`Property with ID ${id} not found`);
  }
  return this.propertyRepository.save(entity);
}

async remove(id: number): Promise<void> {
  const res = await this.propertyRepository.delete(id);
  if (!res.affected) {
    throw new NotFoundException(`Property with ID ${id} not found`);
  }
}
}