import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Booking } from '../entities/booking.entity';
import { BookingService } from './bookings.service';
import { BookingController } from './bookings.controller';
import { RabbitMQModule } from '@shared/rabbitmq/rabbitmq.module';
import { RedisLockService } from '../redis/redis-lock.service';
import { RedisService } from '../redis/redis.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    RabbitMQModule,
  ],
  controllers: [BookingController],
  providers: [BookingService,RabbitMQService,RedisService,RedisLockService],
})
export class BookingModule {}
