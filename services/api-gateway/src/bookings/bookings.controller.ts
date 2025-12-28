import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/user-role.enum';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsGatewayController {
  constructor(private httpService: HttpService) {}

  private readonly bookingServiceUrl =
    process.env.BOOKING_SERVICE_URL || 'http://localhost:3005';

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Request() req) {
    const response = await this.httpService.axiosRef.get(
      `${this.bookingServiceUrl}/bookings`,
      {
        headers: {
          'x-user-id': req.user.sub,
          'x-correlation-id': req.headers['x-correlation-id'],
        },
      },
    );
    return response.data;
  }

  @Get('pending')
  @Roles(UserRole.ADMIN)
  async findPending(@Request() req) {
    const response = await this.httpService.axiosRef.get(
      `${this.bookingServiceUrl}/bookings/pending`,
      {
        headers: {
          'x-user-id': req.user.sub,
          'x-correlation-id': req.headers['x-correlation-id'],
        },
      },
    );
    return response.data;
  }

  @Post()
  @Roles(UserRole.TENANT, UserRole.ADMIN)
  async create(@Body() body: any, @Request() req) {
    const response = await this.httpService.axiosRef.post(
      `${this.bookingServiceUrl}/bookings`,
      body,
      {
        headers: {
          'x-user-id': req.user.sub,
          'x-correlation-id': req.headers['x-correlation-id'],
        },
      },
    );
    return response.data;
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN)
  async approve(@Param('id') id: string, @Request() req) {
    const response = await this.httpService.axiosRef.patch(
      `${this.bookingServiceUrl}/bookings/${id}/approve`,
      {},
      {
        headers: {
          'x-user-id': req.user.sub,
          'x-correlation-id': req.headers['x-correlation-id'],
        },
      },
    );
    return response.data;
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN)
  async reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    const response = await this.httpService.axiosRef.patch(
      `${this.bookingServiceUrl}/bookings/${id}/reject`,
      { reason },
      {
        headers: {
          'x-user-id': req.user.sub,
          'x-correlation-id': req.headers['x-correlation-id'],
        },
      },
    );
    return response.data;
  }
}
