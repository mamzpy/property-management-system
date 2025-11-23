import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('maintenance_requests')
export class Maintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  propertyId: string;

  @Column()
  tenantId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ default: 'open' })
  status: string; // open, in-progress, completed

  @Column({ default: 'low' })
  priority: string; // low, medium, high, urgent

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}