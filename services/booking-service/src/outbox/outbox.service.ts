import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { OutboxEvent } from './outbox-event.entity';

@Injectable()
export class OutboxService {
  constructor(
    @InjectRepository(OutboxEvent)
    private readonly outboxRepo: Repository<OutboxEvent>,
  ) {}

  private repo(manager?: EntityManager) {
    return manager ? manager.getRepository(OutboxEvent) : this.outboxRepo;
  }

  createPendingEvent(
    data: {
      aggregateType: string;
      aggregateId: string;
      eventType: string;
      payload: Record<string, any>;
    },
    manager?: EntityManager,
  ) {
    return this.repo(manager).create({
      aggregateType: data.aggregateType,
      aggregateId: data.aggregateId,
      eventType: data.eventType,
      payload: data.payload,
      status: 'pending',
      attempts: 0,
      lastError: null,
      publishedAt: null,
    });
  }

  async savePendingEvent(
    data: {
      aggregateType: string;
      aggregateId: string;
      eventType: string;
      payload: Record<string, any>;
    },
    manager?: EntityManager,
  ): Promise<OutboxEvent> {
    const event = this.createPendingEvent(data, manager);
    return this.repo(manager).save(event);
  }

  async findPending(limit = 50): Promise<OutboxEvent[]> {
    return this.outboxRepo.find({
      where: { status: 'pending' },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async markPublished(id: string): Promise<void> {
    await this.outboxRepo.update(
      { id },
      { status: 'published', publishedAt: new Date(), lastError: null },
    );
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.outboxRepo.update(
      { id },
      { status: 'failed', lastError: error, publishedAt: null },
    );
  }

  async incrementAttempts(id: string, error?: string): Promise<void> {
    const existing = await this.outboxRepo.findOne({ where: { id } });
    if (!existing) return;

    await this.outboxRepo.update(
      { id },
      {
        attempts: existing.attempts + 1,
        lastError: error ?? existing.lastError,
      },
    );
  }
}