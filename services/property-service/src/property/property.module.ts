import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Property } from '../entities/property.entity';

import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';

import { RabbitMQModule } from '@shared/rabbitmq/rabbitmq.module';
import { BookingReservationSaga } from './booking-reservation.saga';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property]),
    RabbitMQModule,
  ],
  controllers: [PropertyController],
  providers: [
    PropertyService,
    BookingReservationSaga,
  ],
  exports: [PropertyService],
})
export class PropertyModule {}