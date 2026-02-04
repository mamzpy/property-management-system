import { Controller, Get } from '@nestjs/common';

@Controller('bookings')
export class HealthController {
  @Get('health')
  check() {
    return { status: 'ok' };
  }
}