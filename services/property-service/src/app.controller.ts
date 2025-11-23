import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello from Property Service!';
  }

  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }
}
