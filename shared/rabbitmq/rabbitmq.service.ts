import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Connection, Channel, connect } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  private channel: Channel;

  async onModuleInit() {
    this.connection = await connect('amqp://rabbitmq:5672');
    this.channel = await this.connection.createChannel();
  }

  async publish(exchange: string, routingKey: string, message: any) {
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
  }

  async subscribe(
    exchange: string,
    routingKey: string,
    queueName: string,
    handler: (msg: any) => Promise<void>,
  ) {
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    const q = await this.channel.assertQueue(queueName, { durable: true });

    await this.channel.bindQueue(q.queue, exchange, routingKey);

    this.channel.consume(q.queue, async (message) => {
      if (!message) return;

      const payload = JSON.parse(message.content.toString());
      await handler(payload);

      this.channel.ack(message);
    });
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.connection.close();
  }
}
