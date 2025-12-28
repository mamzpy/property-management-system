import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { Property } from '../entities/property.entity';
import { RabbitMQModule } from '@shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property]),
    RabbitMQModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}

