import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantModule } from './tenant/tenant.module';
import { InitTenantSchema1774300000000 } from './database/migrations/1774300000000-InitTenantSchema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME || 'tenant_user',
      password: process.env.DATABASE_PASSWORD || 'tenant_pass',
      database: process.env.DATABASE_NAME || 'tenant_db',
      autoLoadEntities: true,
      synchronize: false,
      migrations: [InitTenantSchema1774300000000], // ✅ direct import, no glob
      migrationsRun: true,
    }),
    TenantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}