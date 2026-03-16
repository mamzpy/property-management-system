import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type OutboxStatus = 'pending' | 'processing' | 'published' | 'failed';

@Entity('outbox_events')
export class OutboxEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  aggregateType: string; // e.g. "booking"

  @Index()
  @Column()
  aggregateId: string; // bookingId

  @Column()
  eventType: string; // e.g. "booking.created"

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Index()
  @Column({ type: 'varchar', default: 'pending' })
  status: OutboxStatus;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'text', nullable: true })
  lastError: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}