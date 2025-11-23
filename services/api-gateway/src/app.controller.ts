import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello from API Gateway!';
  }

  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }
}
