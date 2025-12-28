import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { Tenant } from 'src/entities/tenant.entity';
import { RabbitMQModule } from '@shared/rabbitmq/rabbitmq.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
    RabbitMQModule,
  ],
  controllers: [TenantController],
  providers: [TenantService],
})
export class TenantModule {}
