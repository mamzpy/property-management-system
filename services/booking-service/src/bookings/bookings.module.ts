import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../entities/booking.entity';
import { BookingService } from './bookings.service';
import { BookingController } from './bookings.controller';

import { RabbitMQModule } from '@shared/rabbitmq/rabbitmq.module';
import { RabbitMQService } from '@shared/rabbitmq/rabbitmq.service';

import { RedisService } from '../redis/redis.service';
import { RedisLockService } from '../redis/redis-lock.service';

const isTest = process.env.NODE_ENV === 'test';

const mockRabbit = {
  publish: jest.fn(),
  subscribe: jest.fn(),
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockRedisLock = {
  acquireLock: jest.fn(),
  releaseLock: jest.fn(),
};

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    ...(isTest ? [] : [RabbitMQModule]), 
  ],
  controllers: [BookingController],
  providers: [
    BookingService,

    ...(isTest
      ? [
          { provide: RabbitMQService, useValue: mockRabbit },
          { provide: RedisService, useValue: mockRedis },
          { provide: RedisLockService, useValue: mockRedisLock },
        ]
      : [RabbitMQService, RedisService, RedisLockService]),
  ],
})
export class BookingModule {}