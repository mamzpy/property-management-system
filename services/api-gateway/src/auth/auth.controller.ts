import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Req,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { LoginDto } from '@pms/shared/contracts/auth/login.dto';
import { RegisterDto } from '@pms/shared/contracts/auth/register.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AxiosError } from 'axios';

@Controller('auth')
export class AuthController {
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL');
    if (!authServiceUrl) {
      throw new Error('AUTH_SERVICE_URL is not defined');
    }
    this.authServiceUrl = authServiceUrl;
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
      throw new InternalServerErrorException('Auth service unavailable');
    }
  }

  // 🔐 LOGIN
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/login`, loginDto, {
          headers: { 'x-correlation-id': req.headers['x-correlation-id'] },
        }),
      ),
    );
  }

  // 📝 REGISTER
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
  ): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/auth/register`,
          registerDto,
          {
            headers: { 'x-correlation-id': req.headers['x-correlation-id'] },
          },
        ),
      ),
    );
  }

  // 🔄 REFRESH
  @Post('refresh')
  async refresh(
    @Body() refreshDto: any,
    @Req() req: Request,
  ): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/auth/refresh`,
          refreshDto,
          {
            headers: { 'x-correlation-id': req.headers['x-correlation-id'] },
          },
        ),
      ),
    );
  }

  // ✅ VERIFY
  @Get('verify')
  @ApiBearerAuth()
  async verify(@Req() req: Request): Promise<any> {
    const headers: any = {
      'x-correlation-id': req.headers['x-correlation-id'],
    };
    if (
      req.headers.authorization &&
      req.headers.authorization !== 'undefined' &&
      req.headers.authorization !== 'Bearer undefined'
    ) {
      headers.authorization = req.headers.authorization;
    }
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/auth/verify`, { headers }),
      ),
    );
  }

  // 👤 PROFILE
  @Get('profile')
  @ApiBearerAuth()
  async getProfile(@Req() req: Request): Promise<any> {
    const headers: any = {
      'x-correlation-id': req.headers['x-correlation-id'],
    };
    if (
      req.headers.authorization &&
      req.headers.authorization !== 'undefined' &&
      req.headers.authorization !== 'Bearer undefined'
    ) {
      headers.authorization = req.headers.authorization;
    }
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/auth/profile`, { headers }),
      ),
    );
  }

  // 🚪 LOGOUT
  @Post('logout')
  async logout(@Req() req: Request): Promise<any> {
    const headers: any = {
      'x-correlation-id': req.headers['x-correlation-id'],
    };
    if (
      req.headers.authorization &&
      req.headers.authorization !== 'undefined'
    ) {
      headers.Authorization = req.headers.authorization;
    }
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/auth/logout`,
          {},
          { headers },
        ),
      ),
    );
  }

  // 🔑 CHANGE PASSWORD
  @Put('change-password')
  async changePassword(
    @Body() changePasswordDto: any,
    @Req() req: Request,
  ): Promise<any> {
    const headers: any = {
      'x-correlation-id': req.headers['x-correlation-id'],
    };
    if (
      req.headers.authorization &&
      req.headers.authorization !== 'undefined'
    ) {
      headers.Authorization = req.headers.authorization;
    }
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.put(
          `${this.authServiceUrl}/auth/change-password`,
          changePasswordDto,
          { headers },
        ),
      ),
    );
  }

  // 📧 FORGOT PASSWORD
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: any,
    @Req() req: Request,
  ): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/auth/forgot-password`,
          forgotPasswordDto,
          {
            headers: { 'x-correlation-id': req.headers['x-correlation-id'] },
          },
        ),
      ),
    );
  }

  // 🔓 RESET PASSWORD
  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: any,
    @Req() req: Request,
  ): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/auth/reset-password`,
          resetPasswordDto,
          {
            headers: { 'x-correlation-id': req.headers['x-correlation-id'] },
          },
        ),
      ),
    );
  }

  // ❤️ HEALTH
  @Get('health')
  async healthCheck(@Req() req: Request): Promise<any> {
    return this.forwardRequest(
      firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/auth/health`, {
          headers: { 'x-correlation-id': req.headers['x-correlation-id'] },
        }),
      ),
    );
  }
}