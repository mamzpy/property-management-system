import { Controller, Get, Post, Put, Delete, Body, Param, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3004';
  }

  @Post('login')
  async login(@Body() loginDto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(`${this.authServiceUrl}/auth/login`, loginDto)
    );
    return response.data;
  }

  @Post('register')
  async register(@Body() registerDto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(`${this.authServiceUrl}/auth/register`, registerDto)
    );
    return response.data;
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(`${this.authServiceUrl}/auth/refresh`, refreshDto)
    );
    return response.data;
  }

  @Get('verify')
  async verify(@Req() req: Request): Promise<any> {
    // Only include Authorization header if it exists and is not undefined or 'Bearer undefined'
    const headers: any = {};
    if (req.headers.authorization && 
        req.headers.authorization !== 'undefined' && 
        req.headers.authorization !== 'Bearer undefined') {
      headers.Authorization = req.headers.authorization;
    }

    const response = await firstValueFrom(
      this.httpService.get(`${this.authServiceUrl}/auth/verify`, {
        headers
      })
    );
    return response.data;
  }

  @Get('profile')
  async getProfile(@Req() req: Request): Promise<any> {
    // Only include Authorization header if it exists and is not undefined
    const headers: any = {};
    if (req.headers.authorization && req.headers.authorization !== 'undefined') {
      headers.Authorization = req.headers.authorization;
    }

    const response = await firstValueFrom(
      this.httpService.get(`${this.authServiceUrl}/auth/profile`, {
        headers
      })
    );
    return response.data;
  }

  @Post('logout')
  async logout(@Req() req: Request): Promise<any> {
    // Only include Authorization header if it exists and is not undefined
    const headers: any = {};
    if (req.headers.authorization && req.headers.authorization !== 'undefined') {
      headers.Authorization = req.headers.authorization;
    }

    const response = await firstValueFrom(
      this.httpService.post(`${this.authServiceUrl}/auth/logout`, {}, {
        headers
      })
    );
    return response.data;
  }

  @Put('change-password')
  async changePassword(@Body() changePasswordDto: any, @Req() req: Request): Promise<any> {
    // Only include Authorization header if it exists and is not undefined
    const headers: any = {};
    if (req.headers.authorization && req.headers.authorization !== 'undefined') {
      headers.Authorization = req.headers.authorization;
    }

    const response = await firstValueFrom(
      this.httpService.put(`${this.authServiceUrl}/auth/change-password`, changePasswordDto, {
        headers
      })
    );
    return response.data;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(`${this.authServiceUrl}/auth/forgot-password`, forgotPasswordDto)
    );
    return response.data;
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(`${this.authServiceUrl}/auth/reset-password`, resetPasswordDto)
    );
    return response.data;
  }

  @Get('health')
  async healthCheck(): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.authServiceUrl}/auth/health`)
    );
    return response.data;
  }
}