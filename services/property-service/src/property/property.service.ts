import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  async findAll(): Promise<Property[]> {
    return this.propertyRepository.find();
  }

  async findOne(id: number): Promise<Property> {
    const property = await this.propertyRepository.findOneBy({ id });
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return property;
  }

  async create(propertyData: Partial<Property>): Promise<Property> {
    const property = this.propertyRepository.create(propertyData);
    return this.propertyRepository.save(property);
  }

  async update(id: number, propertyData: Partial<Property>): Promise<Property> {
    await this.propertyRepository.update(id, propertyData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.propertyRepository.delete(id);
  }
}