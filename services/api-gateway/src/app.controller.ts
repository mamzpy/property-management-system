import { Controller, Get } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly http: HttpService) {}

  @Get()
  getHello(): string {
    return 'Hello from API Gateway!';
  }

  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }

  @Get('health/system')
  async getSystemHealth() {
    const services: Record<string, string> = {
      apiGateway: 'http://localhost:3000/health',
      auth: 'http://auth-service:3004/health',
      property: 'http://property-service:3001/properties/health',
      tenant: 'http://tenant-service:3002/health',
      maintenance: 'http://maintenance-service:3003/maintenance/health',
      booking: 'http://booking-service:3005/bookings/health',
    };

    const results: Record<string, string> = {};

    for (const [name, url] of Object.entries(services)) {
      try {
        await firstValueFrom(this.http.get(url));
        results[name] = 'ok';
      } catch {
        results[name] = 'error';
      }
    }

    const overall =
      Object.values(results).every((s) => s === 'ok')
        ? 'healthy'
        : 'degraded';

    return {
      status: overall,
      services: results,
    };
  }
}