import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
} from '@nestjs/common';
import { BookingService } from './bookings.service';
import { CreateBookingDto } from '../dto/create-booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  findAll() {
    return this.bookingService.findAll();
  }

  @Get('pending')
  findPending() {
    return this.bookingService.findPending();
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'booking-service' };
  }

  @Post()
  create(
    @Body() createBookingDto: CreateBookingDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    return this.bookingService.create(
      createBookingDto.propertyId,
      userId,
      correlationId || 'booking-create-no-cid',
    );
  }

  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @Headers('x-user-id') adminId: string,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    return this.bookingService.approve(
      id,
      adminId,
      correlationId || 'booking-approve-no-cid',
    );
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.bookingService.reject(id, reason);
  }

  @Delete('reset/all')
  async resetAll(): Promise<{ message: string }> {
    await this.bookingService.resetAll();
    return { message: 'All bookings cleared' };
  }
}
