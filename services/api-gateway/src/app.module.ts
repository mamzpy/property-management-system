import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { PropertiesController } from './properties/properties.controller';
import { TenantsController } from './tenants/tenants.controller';
import { MaintenanceController } from './maintenance/maintenance.controller';
import { BookingsGatewayController } from './bookings/bookings.controller';
import { ResetService } from './reset/reset.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AppController,
    AuthController,
    BookingsGatewayController,
    PropertiesController,
    TenantsController,
    MaintenanceController,
  ],
  providers: [ResetService],
})
export class AppModule {}
