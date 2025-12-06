import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../entities/booking.entity';
import { BookingService } from './bookings.service';
import { BookingController } from './bookings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Booking])],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
