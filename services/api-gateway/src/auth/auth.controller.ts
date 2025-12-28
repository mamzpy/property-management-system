import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl =
      this.configService.get<string>('AUTH_SERVICE_URL') ||
      'http://localhost:3004';
  }

  // 🔐 LOGIN
  @Post('login')
  async login(@Body() loginDto: any, @Req() req: Request): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.authServiceUrl}/auth/login`,
        loginDto,
        {
          headers: {
            'x-correlation-id': req.headers['x-correlation-id'],
          },
        },
      ),
    );
    return response.data;
  }

  @Post('register')
  async register(
    @Body() registerDto: any,
    @Req() req: Request,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.authServiceUrl}/auth/register`,
        registerDto,
        {
          headers: {
            'x-correlation-id': req.headers['x-correlation-id'],
          },
        },
      ),
    );
    return response.data;
  }

  @Post('refresh')
  async refresh(
    @Body() refreshDto: any,
    @Req() req: Request,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.authServiceUrl}/auth/refresh`,
        refreshDto,
        {
          headers: {
            'x-correlation-id': req.headers['x-correlation-id'],
          },
        },
      ),
    );
    return response.data;
  }

  @Get('verify')
  async verify(@Req() req: Request): Promise<any> {
    const headers: any = {
      'x-correlation-id': req.headers['x-correlation-id'],
    };

    if (
      req.headers.authorization &&
      req.headers.authorization !== 'undefined' &&
      req.headers.authorization !== 'Bearer undefined'
    ) {
      headers.Authorization = req.headers.authorization;
    }

    const response = await firstValueFrom(
      this.httpService.get(`${this.authServiceUrl}/auth/verify`, {
        headers,
      }),
    );
    return response.data;
  }

  @Get('profile')
  async getProfile(@Req() req: Request): Promise<any> {
    const headers: any = {
      'x-correlation-id': req.headers['x-correlation-id'],
    };

    if (
      req.headers.authorization &&
      req.headers.authorization !== 'undefined'
    ) {
      headers.Authorization = req.headers.authorization;
    }

    const response = await firstValueFrom(
      this.httpService.get(`${this.authServiceUrl}/auth/profile`, {
        headers,
      }),
    );
    return response.data;
  }

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

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.authServiceUrl}/auth/logout`,
        {},
        { headers },
      ),
    );
    return response.data;
  }

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

    const response = await firstValueFrom(
      this.httpService.put(
        `${this.authServiceUrl}/auth/change-password`,
        changePasswordDto,
        { headers },
      ),
    );
    return response.data;
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: any,
    @Req() req: Request,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.authServiceUrl}/auth/forgot-password`,
        forgotPasswordDto,
        {
          headers: {
            'x-correlation-id': req.headers['x-correlation-id'],
          },
        },
      ),
    );
    return response.data;
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: any,
    @Req() req: Request,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.authServiceUrl}/auth/reset-password`,
        resetPasswordDto,
        {
          headers: {
            'x-correlation-id': req.headers['x-correlation-id'],
          },
        },
      ),
    );
    return response.data;
  }

  @Get('health')
  async healthCheck(@Req() req: Request): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.authServiceUrl}/auth/health`, {
        headers: {
          'x-correlation-id': req.headers['x-correlation-id'],
        },
      }),
    );
    return response.data;
  }
}
