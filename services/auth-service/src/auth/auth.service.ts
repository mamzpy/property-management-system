import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User, UserStatus } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  tenantId?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId?: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    console.log('🔍 [AuthService] Validating user:', email);
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      console.log('❌ [AuthService] User not found:', email);
      return null;
    }

    if (user.status !== UserStatus.ACTIVE) {
      console.log('❌ [AuthService] User account not active:', email);
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ [AuthService] Invalid password for user:', email);
      return null;
    }

    console.log('✅ [AuthService] User validation successful:', email);

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    const { password: _, ...result } = user;
    return result as User;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    console.log('🔍 [AuthService] Login attempt for:', loginDto.email);
    
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      console.log('❌ [AuthService] Login failed - invalid credentials:', loginDto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      tenantId: user.tenantId,
    };

    console.log('✅ [AuthService] Login successful for:', loginDto.email);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    console.log('🔍 [AuthService] Register called with:', {
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: registerDto.role,
      phone: registerDto.phone
    });

    try {
      const user = await this.usersService.create(registerDto);
      
      console.log('✅ [AuthService] User created successfully:', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      });
      
      if (!user.id) {
        console.error('❌ [AuthService] User ID is missing after creation!');
        throw new Error('User ID is missing after creation');
      }
      
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
      };

      console.log('🔍 [AuthService] Creating JWT with payload:', payload);

      const accessToken = this.jwtService.sign(payload);
      console.log('✅ [AuthService] JWT created successfully');

      const response = {
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
        },
      };

      console.log('✅ [AuthService] Registration completed successfully');
      return response;

    } catch (error) {
      console.error('❌ [AuthService] Registration error:', error);
      console.error('❌ [AuthService] Error stack:', error.stack);
      
      if (error.message && error.message.includes('already exists')) {
        throw new BadRequestException('User with this email already exists');
      }
      throw error;
    }
  }

  async validateUserById(id: string): Promise<User | null> {
    console.log('🔍 [AuthService] Validating user by ID:', id);
    try {
      const user = await this.usersService.findOne(id);
      console.log('✅ [AuthService] User found by ID:', user.email);
      return user;
    } catch (error) {
      console.log('❌ [AuthService] User not found by ID:', id);
      return null;
    }
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    console.log('🔍 [AuthService] Verifying token');
    try {
      const payload = this.jwtService.verify(token);
      console.log('✅ [AuthService] Token verified successfully');
      return payload;
    } catch (error) {
      console.log('❌ [AuthService] Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}