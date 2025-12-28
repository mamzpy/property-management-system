import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Booking } from '../entities/booking.entity';
import { BookingService } from './bookings.service';
import { BookingController } from './bookings.controller';
import { RabbitMQModule } from '@shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    RabbitMQModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
