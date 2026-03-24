import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { PropertyStatus } from '@pms/shared/contracts/property/property-status.enum'; // ✅

export class CreatePropertyDto {
  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @MaxLength(255)
  address: string;

  @ApiProperty({ example: 'Turin' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'Piedmont' })
  @IsString()
  @MaxLength(100)
  state: string;

  @ApiProperty({ example: '10121' })
  @IsString()
  @MaxLength(20)
  zipCode: string;

  @ApiProperty({ example: 1200.5 })
  @IsNumber()
  @Min(0)
  rentAmount: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  bedrooms: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  bathrooms: number;

  @ApiPropertyOptional({ example: 'Nice apartment near city center' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    example: PropertyStatus.AVAILABLE,
    enum: PropertyStatus,
  })
  @IsOptional()
  @IsEnum(PropertyStatus) // ✅ validates against enum values
  status?: PropertyStatus; // ✅ typed
}