# Property Management System

A microservices-based property management platform built with NestJS, TypeORM, and PostgreSQL. Implements JWT authentication, role-based access control, and containerized deployment using Docker.

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Docker Setup](#docker-setup)
- [Development](#development)

## Architecture

The system follows a microservices architecture pattern with five independent services:

- **API Gateway** (Port 3000) - Central entry point for all client requests
- **Auth Service** (Port 3004) - Handles authentication and user management
- **Property Service** (Port 3001) - Manages property listings and details
- **Tenant Service** (Port 3002) - Handles tenant information and relationships
- **Maintenance Service** (Port 3003) - Manages maintenance requests and tracking

All services communicate through a Docker bridge network and share a PostgreSQL database instance.

## Features

### Authentication & Authorization
- JWT-based authentication with bcrypt password hashing
- Role-based access control (Admin, Tenant roles)
- User status management (Active, Inactive, Suspended)
- Protected routes with JWT guards

### Property Management
- Complete CRUD operations for properties
- Property details: address, rent, bedrooms, bathrooms, status
- Multi-status support (Available, Occupied, Maintenance)
- Location-based organization

### User Management
- User registration and authentication
- Profile management and updates
- Role assignment and permissions
- Account status control

### Maintenance System
- Maintenance request creation and tracking
- Status updates and assignment
- Integration with property and tenant services

## Technology Stack

**Backend Framework:** NestJS  
**Database:** PostgreSQL 15  
**ORM:** TypeORM  
**Authentication:** JWT, bcrypt  
**Containerization:** Docker, Docker Compose  
**Base Images:** Node.js 18/20 Alpine Linux  

**Key Development Tools:**
- TypeScript
- ESLint & Prettier
- Jest (Testing)
- Docker multi-stage builds

## Prerequisites

- Docker Desktop or Docker Engine (20.10+)
- Docker Compose (2.0+)
- Git
- 4GB RAM minimum
- 10GB free disk space

For local development without Docker:
- Node.js 20.x or higher
- PostgreSQL 15
- npm or yarn

## Installation

Clone the repository:

```bash
git clone https://github.com/mamzpy/property-management-system.git
cd property-management-system
```

Each service requires environment configuration. Sample files are provided:

```bash
services/auth-service/.env.docker
services/property-service/.env.docker
services/tenant-service/.env.docker
services/maintenance-service/.env.docker
services/api-gateway/.env.docker
```

## Running the Application

Start all services using Docker Compose:

```bash
docker-compose up -d
```

Check service status:

```bash
docker-compose ps
```

View logs:

```bash
docker-compose logs -f
```

Stop all services:

```bash
docker-compose down
```

To remove volumes and reset database:

```bash
docker-compose down -v
```

### Health Check Endpoints

Verify all services are running:

```bash
curl http://localhost:3000/health
curl http://localhost:3004/auth/health
curl http://localhost:3001/properties/health
curl http://localhost:3002/tenants/health
curl http://localhost:3003/maintenance/health
```

## API Endpoints

### Authentication Service

**POST /auth/register** - Register new user  
**POST /auth/login** - User login  
**GET /auth/profile** - Get current user profile (requires JWT)  
**GET /auth/verify** - Verify JWT token validity  
**GET /auth/health** - Service health check  

### Property Service

**GET /properties** - List all properties (requires auth)  
**GET /properties/:id** - Get property details (requires auth)  
**POST /properties** - Create property (admin only)  
**PUT /properties/:id** - Update property (admin only)  
**DELETE /properties/:id** - Delete property (admin only)  
**GET /properties/health** - Service health check  

### Tenant Service

**GET /tenants** - List all tenants (requires auth)  
**GET /tenants/:id** - Get tenant details (requires auth)  
**POST /tenants** - Create tenant (admin only)  
**PUT /tenants/:id** - Update tenant (admin only)  
**DELETE /tenants/:id** - Delete tenant (admin only)  
**GET /tenants/health** - Service health check  

### Maintenance Service

**GET /maintenance** - List maintenance requests (requires auth)  
**GET /maintenance/:id** - Get request details (requires auth)  
**POST /maintenance** - Create maintenance request (requires auth)  
**PUT /maintenance/:id** - Update request status (admin only)  
**DELETE /maintenance/:id** - Delete request (admin only)  
**GET /maintenance/health** - Service health check  

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    firstName VARCHAR NOT NULL,
    lastName VARCHAR NOT NULL,
    phone VARCHAR,
    role VARCHAR DEFAULT 'tenant',
    status VARCHAR DEFAULT 'active',
    tenantId VARCHAR,
    lastLogin TIMESTAMP,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Properties Table

```sql
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    address VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    state VARCHAR NOT NULL,
    zipCode VARCHAR NOT NULL,
    rentAmount DECIMAL(10,2) NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    description TEXT,
    status VARCHAR DEFAULT 'available',
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

## Docker Setup

### Multi-Stage Build Strategy

All services use multi-stage Docker builds to optimize image size:

**Builder Stage:**
- Installs all dependencies including devDependencies
- Compiles TypeScript to JavaScript
- Generates production build

**Production Stage:**
- Uses Alpine Linux base (minimal footprint)
- Installs only production dependencies
- Copies compiled code from builder stage
- Results in 60-70% smaller images

### Image Sizes

- API Gateway: ~236 MB
- Property Service: ~312 MB
- Tenant Service: ~312 MB
- Maintenance Service: ~338 MB
- Auth Service: ~485 MB
- PostgreSQL: ~378 MB

### Service Dependencies

Services start in proper order using health check conditions:

1. PostgreSQL starts first
2. Auth Service starts after database is healthy
3. Other services start after Auth Service is ready
4. API Gateway starts last after all services are ready

### Networking

All containers communicate via a custom bridge network `property_network`. Services resolve each other using service names as hostnames.

### Data Persistence

PostgreSQL data is stored in a named volume `postgres_data` ensuring data survives container restarts and deletions.

## Development

### Running Services Locally

Each service can be run independently for development:

```bash
cd services/auth-service
npm install
npm run start:dev
```

### Running Tests

```bash
npm run test
npm run test:e2e
npm run test:cov
```

### Building for Production

```bash
npm run build
npm run start:prod
```

### Database Migrations

```bash
npm run migration:generate -- -n MigrationName
npm run migration:run
npm run migration:revert
```

## Project Structure

```
property-management-system/
├── services/
│   ├── api-gateway/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.docker
│   ├── auth-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.docker
│   ├── property-service/
│   ├── tenant-service/
│   └── maintenance-service/
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Security Considerations

- JWT tokens expire after configured duration
- Passwords hashed using bcrypt with salt rounds
- Database credentials managed via environment variables
- Services run with minimal privileges
- Input validation on all endpoints
- SQL injection protection via TypeORM parameterized queries

## Author

**Mohammadreza Ghadarjani**  


## License

This project is licensed under UNLICENSED
