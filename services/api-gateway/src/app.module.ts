import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { PropertiesController } from './properties/properties.controller';
import { TenantsController } from './tenants/tenants.controller';
import { MaintenanceController } from './maintenance/maintenance.controller';
import { BookingsGatewayController } from './bookings/bookings.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
  ],
  controllers: [
    AppController,
    AuthController,
    BookingsGatewayController,
    PropertiesController,
    TenantsController,
    MaintenanceController,
  ],
})
export class AppModule {}
