import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance } from '../entities/maintenance.entity';
import { CreateMaintenanceDto } from '../dto/create-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private maintenanceRepository: Repository<Maintenance>,
  ) {}

  async create(createMaintenanceDto: CreateMaintenanceDto): Promise<Maintenance> {
    const maintenance = this.maintenanceRepository.create(createMaintenanceDto);
    return await this.maintenanceRepository.save(maintenance);
  }

  async findAll(): Promise<Maintenance[]> {
    return await this.maintenanceRepository.find();
  }

  async findOne(id: string): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({ where: { id } });
    if (!maintenance) {
      throw new NotFoundException(`Maintenance request with ID ${id} not found`);
    }
    return maintenance;
  }
}