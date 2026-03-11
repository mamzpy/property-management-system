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
    // ✅ don’t run background loop in tests (avoids open handles)
    if (process.env.NODE_ENV === 'test') return;

    this.timer = setInterval(() => {
      this.publishPending().catch(() => {});
    }, 1500);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

private async claimBatch(limit = 10): Promise<OutboxEvent[]> {
  const rows = await this.outboxRepo.query(
    `
    UPDATE outbox_events
    SET status = 'processing'
    WHERE id IN (
      SELECT id
      FROM outbox_events
      WHERE status = 'pending'
      ORDER BY "createdAt" ASC
      LIMIT $1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *;
    `,
    [limit],
  );

  return rows as OutboxEvent[];
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

      this.logger.warn(
        `Outbox publish failed for ${evt.id}: ${message}`,
      );
    }
  }
}
}