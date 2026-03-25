import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  HttpException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AxiosError } from 'axios';
import { CreatePropertyDto } from '@pms/shared/contracts/property/create-property.dto';
import { UpdatePropertyDto } from '@pms/shared/contracts/property/update-property.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/user-role.enum';

@ApiTags('Properties')
@ApiBearerAuth()
@Controller('properties')
export class PropertiesController {
  private readonly propertyServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.propertyServiceUrl =
      this.configService.get<string>('PROPERTY_SERVICE_URL') ||
      'http://localhost:3002';
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
      throw new InternalServerErrorException('Property service unavailable');
    }
  }

  // 🏠 GET ALL PROPERTIES
  @Get()
  async findAll(@Request() req): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.get(`${this.propertyServiceUrl}/properties`, {
          headers: {
            'x-correlation-id': req.headers['x-correlation-id'],
            'Content-Type': 'application/json',
          },
        }),
      ),
    );
  }

  // 🏠 GET PROPERTY BY ID
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.get(`${this.propertyServiceUrl}/properties/${id}`, {
          headers: {
            'x-correlation-id': req.headers['x-correlation-id'],
            'Content-Type': 'application/json',
          },
        }),
      ),
    );
  }

  // 🏠 CREATE PROPERTY
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @Request() req,
  ): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.post(
          `${this.propertyServiceUrl}/properties`,
          createPropertyDto,
          {
            headers: {
              'x-correlation-id': req.headers['x-correlation-id'],
              'Content-Type': 'application/json',
            },
          },
        ),
      ),
    );
  }

  // 🏠 UPDATE PROPERTY
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Request() req,
  ): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.put(
          `${this.propertyServiceUrl}/properties/${id}`,
          updatePropertyDto,
          {
            headers: {
              'x-correlation-id': req.headers['x-correlation-id'],
              'Content-Type': 'application/json',
            },
          },
        ),
      ),
    );
  }

  // 🏠 DELETE PROPERTY
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.delete(
          `${this.propertyServiceUrl}/properties/${id}`,
          {
            headers: {
              'x-correlation-id': req.headers['x-correlation-id'],
              'Content-Type': 'application/json',
            },
          },
        ),
      ),
    );
  }
}