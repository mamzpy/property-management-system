import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { Maintenance } from './entities/maintenance.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'devpassword',
      database: process.env.DATABASE_NAME || 'property_management',
      entities: [Maintenance],
      synchronize: true,
    }),
    MaintenanceModule,
  ],
})
export class AppModule {}