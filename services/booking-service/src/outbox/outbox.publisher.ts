import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OutboxEvent } from './outbox-event.entity';
import { RabbitMQService } from '@pms/shared/rabbitmq/rabbitmq.service';

@Injectable()
export class OutboxPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisher.name);
  private timer?: NodeJS.Timeout;

  constructor(
    @InjectRepository(OutboxEvent)
    private readonly outboxRepo: Repository<OutboxEvent>,
    private readonly rabbit: RabbitMQService,
  ) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'test') return;
    this.timer = setInterval(() => {
      this.publishPending().catch(() => {});
    }, 1500);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async claimBatch(limit = 10): Promise<OutboxEvent[]> {
    return this.outboxRepo.manager.transaction(async (manager) => {
      const rows = await manager
        .createQueryBuilder(OutboxEvent, 'evt')
        .setLock('pessimistic_write_or_fail')
        .where('evt.status = :status', { status: 'pending' })
        .orderBy('evt.createdAt', 'ASC')
        .limit(limit)
        .getMany();

      if (rows.length === 0) return [];

      const ids = rows.map((r) => r.id);
      await manager
        .createQueryBuilder()
        .update(OutboxEvent)
        .set({ status: 'processing' })
        .whereInIds(ids)
        .execute();

      return rows;
    });
  }

  private async publishPending() {
    const batch = await this.claimBatch(10);
    for (const evt of batch) {
      try {
        await this.rabbit.publish(
          evt.aggregateType,
          evt.eventType,
          evt.payload,
        );
        await this.outboxRepo.update(
          { id: evt.id },
          {
            status: 'published',
            publishedAt: new Date(),
            lastError: null,
          },
        );
        this.logger.log(`Published ${evt.eventType} for ${evt.aggregateId}`);
      } catch (err: any) {
        const message = err?.message ?? String(err);
        await this.outboxRepo.update(
          { id: evt.id },
          {
            status: 'pending',
            attempts: (evt.attempts ?? 0) + 1,
            lastError: message,
          },
        );
        this.logger.warn(`Outbox publish failed for ${evt.id}: ${message}`);
      }
    }
  }
}
