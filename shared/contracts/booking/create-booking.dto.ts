import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the property to book',
  })
  propertyId: number;
}