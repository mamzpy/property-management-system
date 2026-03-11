import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    ConfigModule,          // <-- needed so registerAsync can read from env
    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => {
        const secret =
          configService.get<string>('JWT_SECRET') ||
          'your-super-secret-jwt-key-change-in-production';

        // Use numeric seconds (real-world, avoids TS error)
        const expiresIn =
          Number(configService.get<string>('JWT_EXPIRES_IN')) ||
          24 * 60 * 60; // 24h

        return {
          secret,
          signOptions: {
            expiresIn, // must be number | StringValue
          },
        };
      },
    }),

    UsersModule,
  ],

  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}