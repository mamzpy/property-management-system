import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyStatus } from './property-status.enum'; // ✅ import from shared

export class CreatePropertyDto {
  @ApiProperty({ example: 'Via Roma 10' })
  address: string;

  @ApiProperty({ example: 'Torino' })
  city: string;

  @ApiProperty({ example: 'Piedmont' })
  state: string;

  @ApiProperty({ example: '10121' })
  zipCode: string;

  @ApiProperty({ example: 1200 })
  rentAmount: number;

  @ApiProperty({ example: 2 })
  bedrooms: number;

  @ApiProperty({ example: 1 })
  bathrooms: number;

  @ApiPropertyOptional({ example: 'Spacious apartment near city center' })
  description?: string;

  @ApiPropertyOptional({ 
    example: PropertyStatus.AVAILABLE,
    enum: PropertyStatus,
  })
  status?: PropertyStatus;
}