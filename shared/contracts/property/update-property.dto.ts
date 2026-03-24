import { PartialType } from '@nestjs/swagger'; // ← swagger version, not mapped-types
import { CreatePropertyDto } from './create-property.dto';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}