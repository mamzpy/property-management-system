# Property Management System

A comprehensive **NestJS microservices architecture** for property management with role-based authentication, built with Docker and PostgreSQL.

## 🏗️ Architecture Overview

This system consists of **5 microservices** working together to provide a complete property management solution:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │   Auth Service  │    │Property Service │
│    Port 3000    │────│    Port 3004    │    │    Port 3001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │ Tenant Service  │    │Maintenance Svc  │
         └──────────────│    Port 3002    │    │    Port 3003    │
                        └─────────────────┘    └─────────────────┘
                                 │                       │
                        ┌─────────────────────────────────────────┐
                        │          PostgreSQL Database            │
                        │            Port 5432                    │
                        └─────────────────────────────────────────┘
```

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with bcrypt password hashing
- **Role-based access control** (Admin, Tenant)
- **User status management** (Active, Inactive, Suspended)
- **Protected routes** with JWT guards
- **Token verification** endpoints

### 🏢 Property Management
- **CRUD operations** for properties
- **Property details**: Address, rent amount, bedrooms, bathrooms
- **Property status tracking** (Available, Occupied, Maintenance)
- **Location-based organization** (City, State, ZIP)

### 👥 User Management
- **User registration** and profile management
- **Role assignment** (Admin/Tenant)
- **User status control** for account management
- **Profile retrieval** and updates

### 🔧 Maintenance System
- **Maintenance request** management
- **Service integration** with other microservices
- **Status tracking** for maintenance tasks

### 🌐 API Gateway
- **Centralized routing** to all microservices
- **Request forwarding** and load balancing
- **Service health monitoring**
- **Unified API entry point**

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **NestJS** | Backend framework |
| **TypeORM** | Database ORM |
| **PostgreSQL** | Database |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |

## 📁 Project Structure

```
property-management-system/
├── services/
│   ├── api-gateway/          # Main entry point (Port 3000)
│   ├── auth-service/         # Authentication service (Port 3004)
│   ├── property-service/     # Property management (Port 3001)
│   ├── tenant-service/       # Tenant management (Port 3002)
│   └── maintenance-service/  # Maintenance requests (Port 3003)
├── docker-compose.yml        # Docker orchestration
├── .gitignore               # Git ignore rules
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose**
- **Node.js** 20+ (for local development)
- **PostgreSQL** (handled by Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/mamzpy/property-management-system.git
cd property-management-system
```

### 2. Environment Setup
Each service has its own environment configuration:
- `services/auth-service/.env.docker`
- `services/property-service/.env.docker`
- `services/tenant-service/.env.docker`
- `services/maintenance-service/.env.docker`
- `services/api-gateway/.env.docker`

### 3. Start All Services
```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 4. Access the Application
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3004
- **Property Service**: http://localhost:3001
- **Tenant Service**: http://localhost:3002
- **Maintenance Service**: http://localhost:3003
- **PostgreSQL**: localhost:5432

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    firstName VARCHAR NOT NULL,
    lastName VARCHAR NOT NULL,
    phone VARCHAR,
    role ENUM('admin', 'tenant') DEFAULT 'tenant',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
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

## 🔗 API Endpoints

### Authentication Service (`/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | User registration | ❌ |
| POST | `/auth/login` | User login | ❌ |
| GET | `/auth/profile` | Get user profile | ✅ |
| GET | `/auth/verify` | Verify JWT token | ✅ |
| GET | `/auth/health` | Service health check | ❌ |

### Property Service (`/properties`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/properties` | Get all properties | ✅ |
| GET | `/properties/:id` | Get property by ID | ✅ |
| POST | `/properties` | Create new property | ✅ (Admin) |
| PUT | `/properties/:id` | Update property | ✅ (Admin) |
| DELETE | `/properties/:id` | Delete property | ✅ (Admin) |
| GET | `/properties/health` | Service health check | ❌ |

### User Roles
- **Admin**: Full access to all endpoints, can manage properties, tenants, and maintenance
- **Tenant**: Limited access, can view properties and submit maintenance requests

## 🐳 Docker Configuration

### Services Health Checks
All services include health checks to ensure proper startup order:
- **PostgreSQL**: Ready check with `pg_isready`
- **Auth Service**: HTTP health endpoint
- **Property Service**: HTTP health endpoint
- **Tenant Service**: HTTP health endpoint
- **Maintenance Service**: HTTP health endpoint
- **API Gateway**: HTTP health endpoint

### Service Dependencies
```yaml
# Example dependency chain
api-gateway:
  depends_on:
    - auth-service
    - property-service
    - tenant-service
    - maintenance-service
```

## 🔧 Development

### Running Individual Services
```bash
# Auth Service
cd services/auth-service
npm install
npm run start:dev

# Property Service
cd services/property-service
npm install
npm run start:dev
```

### Running Tests
```bash
# Run tests for all services
docker-compose exec auth-service npm run test
docker-compose exec property-service npm run test
```

### Database Migrations
```bash
# Run migrations
docker-compose exec auth-service npm run migration:run
```

## 🛡️ Security Features

- **JWT Token Authentication**
- **Password Hashing** with bcrypt
- **Role-based Access Control**
- **Input Validation** with class-validator
- **Environment Variable Protection**
- **Database Connection Security**

## 📝 Environment Variables

Key environment variables for configuration:
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`
- `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `PORT` (for each service)
- Service URLs for inter-service communication

## 🚀 Deployment

### Production Deployment
1. **Set production environment variables**
2. **Configure proper JWT secrets**
3. **Set up production database**
4. **Configure reverse proxy (Nginx)**
5. **Enable HTTPS/SSL**

### Scaling
Each microservice can be scaled independently:
```bash
docker-compose up -d --scale property-service=3
docker-compose up -d --scale tenant-service=2
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

## 👨‍💻 Author

**Mohammadreza Ghadarjani**
- GitHub: [@mamzpy](https://github.com/mamzpy)

---

## 🔄 Service Status

Check all services are running:
```bash
curl http://localhost:3000/health      # API Gateway
curl http://localhost:3004/auth/health # Auth Service
curl http://localhost:3001/properties/health # Property Service
curl http://localhost:3002/tenants/health    # Tenant Service
curl http://localhost:3003/maintenance/health # Maintenance Service
```

**Built with ❤️ using NestJS Microservices Architecture**