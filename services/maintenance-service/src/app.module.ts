import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { Maintenance } from './entities/maintenance.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME || 'maintenance_user',
      password: process.env.DATABASE_PASSWORD || 'maintenance_pass',
      database: process.env.DATABASE_NAME || 'maintenance_db',
      entities: [Maintenance],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    MaintenanceModule,
  ],
})
export class AppModule {}