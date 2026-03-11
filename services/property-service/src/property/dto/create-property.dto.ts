import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
}

export class CreatePropertyDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;
}