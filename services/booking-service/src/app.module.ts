import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BookingModule } from './bookings/bookings.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

   TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get<string>('DATABASE_HOST') || 'localhost',
    port: parseInt(config.get<string>('DATABASE_PORT') || '5432', 10),
    username: config.get<string>('DATABASE_USERNAME') || 'postgres',
    password: config.get<string>('DATABASE_PASSWORD') || 'postgres',
    database: config.get<string>('DATABASE_NAME') || 'booking_e2e',

    autoLoadEntities: true,
    synchronize: true,

    retryAttempts: 0,
    retryDelay: 0,
  }),
}),

    BookingModule,
    HealthModule, 
  ],
})
export class AppModule {}