import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Property } from '../entities/property.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'property_user',
  password: process.env.DATABASE_PASSWORD || 'property_pass',
  database: process.env.DATABASE_NAME || 'property_db',
  entities: ['dist/services/property-service/src/**/*.entity.js'],  
  migrations: ['dist/services/property-service/src/database/migrations/*.js'],
  synchronize: false,
});