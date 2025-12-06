import { IsNumber, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  propertyId: number;

}
