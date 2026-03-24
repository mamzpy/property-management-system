import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ResetService {
  private readonly logger = new Logger(ResetService.name);

  private readonly propertyServiceUrl =
    process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002';
  private readonly bookingServiceUrl =
    process.env.BOOKING_SERVICE_URL || 'http://localhost:3005';
  private readonly tenantServiceUrl =
    process.env.TENANT_SERVICE_URL || 'http://localhost:3004';

  constructor(private readonly httpService: HttpService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async nightlyReset() {
    this.logger.log('Nightly reset started...');

    try {
      await firstValueFrom(
        this.httpService.delete(`${this.tenantServiceUrl}/tenants/reset/all`),
      );
      this.logger.log('✅ Tenants cleared');
    } catch (e) {
      this.logger.error(`Failed to clear tenants: ${e.message}`);
    }

    try {
      await firstValueFrom(
        this.httpService.delete(`${this.bookingServiceUrl}/bookings/reset/all`),
      );
      this.logger.log('✅ Bookings cleared');
    } catch (e) {
      this.logger.error(`Failed to clear bookings: ${e.message}`);
    }

    try {
      await firstValueFrom(
        this.httpService.post(`${this.propertyServiceUrl}/properties/internal/reset`),
      );
      this.logger.log('✅ Properties reset to available');
    } catch (e) {
      this.logger.error(`Failed to reset properties: ${e.message}`);
    }

    this.logger.log('Nightly reset complete');
  }
}
