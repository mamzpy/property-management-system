import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertyStatus } from '@pms/shared/contracts/property/property-status.enum';

@Injectable()
export class PropertyService implements OnModuleInit {
  private readonly logger = new Logger(PropertyService.name);

  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async onModuleInit() {
    await this.seedProperties();
  }

  private async seedProperties() {
    const count = await this.propertyRepository.count();
    if (count > 0) {
      this.logger.log(`Seed skipped — ${count} properties already exist`);
      return;
    }

    const properties = [
      { id: 1,  address: 'Via Roma 1',         city: 'Milan',  state: 'Lombardy',  zipCode: '20121', rentAmount: 1800, bedrooms: 3, bathrooms: 2, description: 'Luxury apartment in city center' },
      { id: 2,  address: 'Via Nazionale 2',    city: 'Rome',   state: 'Lazio',     zipCode: '00184', rentAmount: 2200, bedrooms: 4, bathrooms: 2, description: 'Spacious flat near Colosseum' },
      { id: 3,  address: 'Via Toledo 3',       city: 'Naples', state: 'Campania',  zipCode: '80132', rentAmount: 1100, bedrooms: 2, bathrooms: 1, description: 'Cozy apartment in historic center' },
      { id: 4,  address: 'Via Garibaldi 4',    city: 'Turin',  state: 'Piedmont',  zipCode: '10122', rentAmount: 1300, bedrooms: 2, bathrooms: 1, description: 'Modern flat near Juventus stadium' },
      { id: 5,  address: 'Via Dante 5',        city: 'Florence', state: 'Tuscany', zipCode: '50122', rentAmount: 1600, bedrooms: 3, bathrooms: 2, description: 'Elegant apartment near Duomo' },
      { id: 6,  address: 'Via Mazzini 6',      city: 'Venice', state: 'Veneto',    zipCode: '30121', rentAmount: 2500, bedrooms: 3, bathrooms: 2, description: 'Canal-view apartment' },
      { id: 7,  address: 'Via Cavour 7',       city: 'Bologna', state: 'Emilia-Romagna', zipCode: '40121', rentAmount: 1200, bedrooms: 2, bathrooms: 1, description: 'Studio near university' },
      { id: 8,  address: 'Via Verdi 8',        city: 'Genoa',  state: 'Liguria',   zipCode: '16121', rentAmount: 1000, bedrooms: 1, bathrooms: 1, description: 'Compact flat near the port' },
      { id: 9,  address: 'Via Leopardi 9',     city: 'Palermo', state: 'Sicily',   zipCode: '90133', rentAmount: 900,  bedrooms: 2, bathrooms: 1, description: 'Sunny apartment in old town' },
      { id: 10, address: 'Via Amendola 10',    city: 'Bari',   state: 'Apulia',    zipCode: '70121', rentAmount: 950,  bedrooms: 2, bathrooms: 1, description: 'Bright flat near the sea' },
    ];

    for (const p of properties) {
      await this.propertyRepository.query(
        `INSERT INTO properties (id, address, city, state, "zipCode", "rentAmount", bedrooms, bathrooms, description, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'available')
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.address, p.city, p.state, p.zipCode, p.rentAmount, p.bedrooms, p.bathrooms, p.description],
      );
    }

    // Reset sequence so next auto-generated ID starts after 10
    await this.propertyRepository.query(
      `SELECT setval(pg_get_serial_sequence('properties', 'id'), 10, true)`,
    );

    this.logger.log('Seeded 10 demo properties (IDs 1–10)');
  }

  async resetForDemo(): Promise<void> {
    await this.propertyRepository.query(
      `UPDATE properties SET status = 'available' WHERE id <= 10`,
    );
    this.logger.log('Demo reset — all properties set to available');
  }

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

  async create(dto: CreatePropertyDto): Promise<Property> {
    const entity = this.propertyRepository.create(dto);
    return this.propertyRepository.save(entity);
  }

  async update(id: number, dto: UpdatePropertyDto): Promise<Property> {
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
