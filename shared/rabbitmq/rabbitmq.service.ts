import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import type { Channel, ChannelModel, ConsumeMessage } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection!: ChannelModel;
  private channel!: Channel;

  async onModuleInit() {
    const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
  }

  async publish(exchange: string, routingKey: string, message: unknown) {
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
  }

  async subscribe(
    exchange: string,
    routingKey: string,
    queueName: string,
    handler: (payload: any) => Promise<void>,
  ) {
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    const q = await this.channel.assertQueue(queueName, { durable: true });
    await this.channel.bindQueue(q.queue, exchange, routingKey);

    await this.channel.consume(q.queue, async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString());
        await handler(payload);
        this.channel.ack(msg);
      } catch (err) {
        // don’t lose message if handler crashes
        this.channel.nack(msg, false, true);
      }
    });
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
    } finally {
      await this.connection?.close();
    }
  }
}