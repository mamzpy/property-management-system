import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import type { Channel, ChannelModel, ConsumeMessage } from 'amqplib';

type SubscribeOptions = {
  prefetch?: number;      // concurrency
  maxRetries?: number;    // after this -> DLQ
  retryDelayMs?: number;  // delay before retry (TTL)
};

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection!: ChannelModel;
  private channel!: Channel;

 async onModuleInit() {
  const host = process.env.RABBITMQ_HOST || 'property-rabbitmq';
  const port = process.env.RABBITMQ_PORT || '5672';

  const url =
    process.env.RABBITMQ_URL ||
    `amqp://${host}:${port}`;

  this.connection = await amqp.connect(url);
  this.channel = await this.connection.createChannel();
}

  // ========================
  // PUBLISH
  // ========================
  async publish(
    exchange: string,
    routingKey: string,
    message: unknown,
    headers?: Record<string, any>,
  ) {
    await this.channel.assertExchange(exchange, 'topic', {
      durable: true,
    });

    this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        contentType: 'application/json',
        headers: headers ?? {},
      },
    );
  }

  // ========================
  // SUBSCRIBE WITH RETRY + DLQ
  // ========================
  async subscribe(
    exchange: string,
    routingKey: string,
    queueName: string,
    handler: (payload: any, raw: ConsumeMessage) => Promise<void>,
    opts: SubscribeOptions = {},
  ) {
    const prefetch = opts.prefetch ?? 10;
    const maxRetries = opts.maxRetries ?? 5;
    const retryDelayMs = opts.retryDelayMs ?? 5000;

    await this.channel.assertExchange(exchange, 'topic', {
      durable: true,
    });

    const dlx = `${queueName}.dlx`;
    const dlqName = `${queueName}.dlq`;
    const retryQueueName = `${queueName}.retry`;

    // DLX exchange
    await this.channel.assertExchange(dlx, 'direct', {
      durable: true,
    });

    // DLQ
    await this.channel.assertQueue(dlqName, { durable: true });
    await this.channel.bindQueue(dlqName, dlx, 'dlq');

    // Retry queue (TTL → dead-letter back to main queue)
    await this.channel.assertQueue(retryQueueName, {
      durable: true,
      arguments: {
        'x-message-ttl': retryDelayMs,
        'x-dead-letter-exchange': dlx,
        'x-dead-letter-routing-key': 'main',
      },
    });

    // Main queue
    const q = await this.channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': dlx,
        'x-dead-letter-routing-key': 'dlq',
      },
    });

    await this.channel.bindQueue(q.queue, exchange, routingKey);
    await this.channel.prefetch(prefetch);

    await this.channel.consume(q.queue, async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString());
        await handler(payload, msg);

        this.channel.ack(msg);
      } catch (err) {
        const headers = msg.properties.headers ?? {};
        const prevAttempts = Number(headers['x-attempts'] ?? 0);
        const nextAttempts = prevAttempts + 1;

        const baseHeaders = {
          ...headers,
          'x-attempts': nextAttempts,
          'x-last-error':
            err instanceof Error ? err.message : String(err),
        };

        // Ack original message (avoid infinite nack loop)
        this.channel.ack(msg);

        if (nextAttempts > maxRetries) {
          // Send to DLQ
          this.channel.sendToQueue(
            dlqName,
            msg.content,
            {
              persistent: true,
              contentType:
                msg.properties.contentType ?? 'application/json',
              headers: baseHeaders,
            },
          );
        } else {
          // Send to retry queue
          this.channel.sendToQueue(
            retryQueueName,
            msg.content,
            {
              persistent: true,
              contentType:
                msg.properties.contentType ?? 'application/json',
                headers: baseHeaders,
            },
          );
        }
      }
    });
  }

  // ========================
  // CLEAN SHUTDOWN
  // ========================
  async onModuleDestroy() {
    try {
      await this.channel?.close();
    } finally {
      await this.connection?.close();
    }
  }
}