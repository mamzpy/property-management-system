import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Booking } from '../entities/booking.entity';
import { BookingService } from './bookings.service';
import { BookingController } from './bookings.controller';

import { RabbitMQModule } from '@pms/shared/rabbitmq/rabbitmq.module';
import { RedisModule } from '../redis/redis.module';
import { OutboxModule } from '../outbox/outbox.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    RabbitMQModule,
    RedisModule,
    OutboxModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}