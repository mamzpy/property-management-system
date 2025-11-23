import { IsString, IsOptional } from 'class-validator';

export class CreateMaintenanceDto {
  @IsString()
  propertyId: string;

  @IsString()
  tenantId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  priority?: string;
}