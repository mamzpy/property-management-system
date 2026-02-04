import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';

export enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  propertyId: number;

  @Column()
  tenantId: string;

  @Column({
  type: process.env.NODE_ENV === 'test' ? 'text' : 'enum',
  enum: process.env.NODE_ENV === 'test' ? undefined : BookingStatus,
  })
  status: BookingStatus;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date; // When admin approved

  @Column({ nullable: true })
  approvedBy?: string; // Which admin approved (user ID)

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}