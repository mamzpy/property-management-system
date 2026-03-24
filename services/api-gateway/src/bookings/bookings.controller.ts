import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AxiosError } from 'axios';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/user-role.enum';
import { CreateBookingDto } from '@pms/shared/contracts/booking/create-booking.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsGatewayController {
  private readonly bookingServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.bookingServiceUrl =
      this.configService.get<string>('BOOKING_SERVICE_URL') ||
      'http://localhost:3005';
  }

  // ✅ Reusable error forwarder
  private async forwardRequest<T>(request: Promise<{ data: T }>): Promise<T> {
    try {
      const response = await request;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      if (axiosError.response) {
        throw new HttpException(
          axiosError.response.data,
          axiosError.response.status,
        );
      }
      throw new InternalServerErrorException('Booking service unavailable');
    }
  }

  // 📋 GET ALL BOOKINGS (admin only)
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Request() req): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.get(`${this.bookingServiceUrl}/bookings`, {
          headers: {
            'x-user-id': req.user.sub,
            'x-correlation-id': req.headers['x-correlation-id'],
          },
        }),
      ),
    );
  }

  // 📋 GET PENDING BOOKINGS (admin only)
  @Get('pending')
  @Roles(UserRole.ADMIN)
  async findPending(@Request() req): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.get(`${this.bookingServiceUrl}/bookings/pending`, {
          headers: {
            'x-user-id': req.user.sub,
            'x-correlation-id': req.headers['x-correlation-id'],
          },
        }),
      ),
    );
  }

  // 📋 CREATE BOOKING (tenant or admin)
  @Post()
  @Roles(UserRole.TENANT, UserRole.ADMIN)
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req,
  ): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.post(
          `${this.bookingServiceUrl}/bookings`,
          createBookingDto,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': req.user.sub,       // ✅ JWT user forwarded
              'x-correlation-id': req.headers['x-correlation-id'],
            },
          },
        ),
      ),
    );
  }

  // ✅ APPROVE BOOKING (admin only)
  @Patch(':id/approve')
  @Roles(UserRole.ADMIN)
  async approve(@Param('id') id: string, @Request() req): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.patch(
          `${this.bookingServiceUrl}/bookings/${id}/approve`,
          {},
          {
            headers: {
              'x-user-id': req.user.sub,
              'x-correlation-id': req.headers['x-correlation-id'],
            },
          },
        ),
      ),
    );
  }

  // ❌ REJECT BOOKING (admin only)
  @Patch(':id/reject')
  @Roles(UserRole.ADMIN)
  async reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.patch(
          `${this.bookingServiceUrl}/bookings/${id}/reject`,
          { reason },
          {
            headers: {
              'x-user-id': req.user.sub,
              'x-correlation-id': req.headers['x-correlation-id'],
            },
          },
        ),
      ),
    );
  }
}