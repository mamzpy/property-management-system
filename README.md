# Property Management System

A production-grade microservices backend platform for managing rental properties, tenants, bookings, and maintenance operations.  
Built using **NestJS**, **TypeScript**, **PostgreSQL**, and **Docker**, following modern distributed system architecture principles.

## Overview
Architecture Diagram
                         +------------------------+
                         |      API Gateway       |
                         |         :3000          |
                         +-----------+------------+
                                     |
        +------------+---------------+----------------+----------------+--------------+
        |            |               |                |                |              |
+---------------+ +---------------+ +---------------+ +---------------+ +---------------+
|     Auth      | |   Property    | |    Tenant     | |  Maintenance  | |    Booking    |
|     :3001     | |     :3002     | |     :3004     | |     :3003     | |     :3005     |
+---------------+ +---------------+ +---------------+ +---------------+ +---------------+

                       Shared PostgreSQL Database (:5432)


This system provides a scalable backend solution capable of handling:

- User registration, authentication, and authorization
- Property listing and management
- Tenant records and lifecycle
- Booking workflows with administrative approval
- Maintenance request management

The platform is organized into multiple autonomous services connected through an API Gateway.

## System Architecture

The system consists of six independent microservices:

| Service | Description | Port |
|---------|-------------|------|
| API Gateway | Central entry point, authentication, routing | 3000 |
| Auth Service | User accounts, JWT, roles | 3004 |
| Property Service | Property CRUD operations | 3001 |
| Tenant Service | Tenant record management | 3002 |
| Maintenance Service | Maintenance requests | 3003 |
| Booking Service | Booking workflow (request, approval, rejection) | 3005 |
| PostgreSQL | Shared database | 5432 |

## Overview

This system is structured using a microservices architecture where each service is independently deployable and communicates through a central API Gateway.

**Platform capabilities include:**

- User registration, authentication, and authorization  
- Property listing and management  
- Tenant lifecycle and record tracking  
- Booking workflow with administrative approval  
- Maintenance request management  

All services run inside Docker containers and share a PostgreSQL instance.

---

## Architecture

```
                    +------------------------+
                    |      API Gateway       |
                    |         :3000          |
                    +-----------+------------+
                                |
        +-----------------------+-----------------------+
        |           |           |           |           |
   +--------+  +----------+  +--------+  +--------+  +-------------+
   |  Auth  |  | Property |  | Tenant |  | Booking|  | Maintenance |
   | :3004  |  |  :3001   |  | :3002  |  | :3005  |  |    :3003    |
   +--------+  +----------+  +--------+  +--------+  +-------------+
        |           |           |           |           |
        +-------------------+-------------------+-------+
                            |
                +-----------------------+
                |   PostgreSQL :5432    |
                +-----------------------+
```

---

## Microservices Summary

| Service            | Description                                 | Port |
|-------------------|---------------------------------------------|------|
| API Gateway       | Routing, JWT validation, RBAC               | 3000 |
| Auth Service      | Authentication, users, roles                | 3004 |
| Property Service  | CRUD for rental properties                  | 3001 |
| Tenant Service    | Tenant records and linkage                  | 3002 |
| Maintenance       | Maintenance request workflow                | 3003 |
| Booking Service   | Booking create/approve/reject logic         | 3005 |
| PostgreSQL        | Shared database                             | 5432 |

---

## Technology Stack

- **NestJS (TypeScript)** - Backend framework
- **PostgreSQL + TypeORM** - Database and ORM
- **JWT Authentication** - Secure token-based auth
- **Docker & Docker Compose** - Containerization
- **REST API** - Service communication
- **Axios** - HTTP client for service-to-service calls
- **class-validator** - DTO validation
- **Jest** - Unit and integration testing
- **GitHub Actions** - CI/CD pipeline

---

## Installation & Setup

### Requirements
- Docker  
- Docker Compose  

### Steps

```bash
# Clone repository
git clone https://github.com/mamzpy/property-management-system.git
cd property-management-system

# Start all services
docker compose up --build -d

# Check service status
docker compose ps

# View logs
docker compose logs -f
```

### Stopping Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (deletes all data)
docker compose down -v
```

---

## Service Access

| Service          | URL                         |
|------------------|-----------------------------|
| API Gateway      | http://localhost:3000       |
| Auth Service     | http://localhost:3004       |
| Property Service | http://localhost:3001       |
| Tenant Service   | http://localhost:3002       |
| Maintenance      | http://localhost:3003       |
| Booking Service  | http://localhost:3005       |
| PostgreSQL       | localhost:5432              |

---

## API Endpoints

### Authentication

```http
POST   /auth/register      # Register new user
POST   /auth/login         # User login
GET    /auth/profile       # Get user profile (requires JWT)
```

### Properties

```http
GET    /properties         # Get all properties
GET    /properties/:id     # Get property by ID
POST   /properties         # Create new property (admin only)
PATCH  /properties/:id     # Update property (admin only)
DELETE /properties/:id     # Delete property (admin only)
```

### Bookings

```http
POST   /bookings                 # Create new booking
GET    /bookings                 # Get all bookings
GET    /bookings/pending         # Get pending bookings
PATCH  /bookings/:id/approve     # Approve booking (admin only)
PATCH  /bookings/:id/reject      # Reject booking (admin only)
```

### Tenants

```http
GET    /tenants            # Get all tenants
GET    /tenants/:id        # Get tenant by ID
POST   /tenants            # Create new tenant
PATCH  /tenants/:id        # Update tenant
DELETE /tenants/:id        # Delete tenant
```

### Maintenance

```http
GET    /maintenance        # Get all maintenance requests
GET    /maintenance/:id    # Get request by ID
POST   /maintenance        # Create maintenance request
PATCH  /maintenance/:id    # Update request status
DELETE /maintenance/:id    # Delete request
```

---

## Project Structure

```
property-management-system/
├── services/
│   ├── api-gateway/
│   │   ├── src/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── .env.docker
│   ├── auth-service/
│   │   ├── src/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── .env.docker
│   ├── property-service/
│   │   ├── src/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── .env.docker
│   ├── tenant-service/
│   │   ├── src/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── .env.docker
│   ├── maintenance-service/
│   │   ├── src/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── .env.docker
│   └── booking-service/
│       ├── src/
│       ├── test/
│       ├── Dockerfile
│       └── .env.docker
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml
└── README.md
```

---

## Testing

This project includes comprehensive unit tests for core business logic using **Jest**.

### Test Coverage

The following services have unit tests implemented:

- **Booking Service** - Create, approve, and reject booking logic
- **Property Service** - Property creation and retrieval logic
- **Auth Service** - User registration and authentication flows *(if implemented)*

### Running Tests

```bash
# Run tests for a specific service
cd services/booking-service
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

## Deployment

The Property Management System is deployed on AWS EC2 using Docker Compose.

### Live Health Endpoint
API Gateway:
http://18.201.231.15:3000/health

### Running Services
- API Gateway
- Auth Service
- Property Service
- Tenant Service
- Maintenance Service
- Booking Service
- RabbitMQ (event messaging)
- Redis (caching)
- PostgreSQL (service databases)

This deployment runs the full PMS stack on AWS EC2 with Docker Compose, including API Gateway, microservices, PostgreSQL, Redis, and RabbitMQ.
### Example Endpoints
- API Gateway Health: http://18.201.231.15:3000/health
- Property Service Health: http://18.201.231.15:3002/properties/health
- Booking Service Health: http://18.201.231.15:3005/bookings/health
Live API:
http://18.201.231.15:3000/health

Example services:
http://18.201.231.15:3002/properties/health
http://18.201.231.15:3005/bookings/health


## Database Schema Overview

**CI Workflow includes:**
- Install dependencies
- Run unit tests
- Generate coverage reports
- Validate build process

---

## Security Practices

- **JWT-based authentication** - Secure token generation and validation
- **Bcrypt password hashing** - Industry-standard password encryption
- **Role-based access control (RBAC)** - Admin and user permission levels
- **Input validation with DTOs** - Request payload validation using class-validator
- **Service isolation** - Each microservice runs in its own Docker container
- **Environment variables** - Sensitive data stored in `.env.docker` files
- **Database health checks** - Ensures services connect only when DB is ready

---

## Environment Variables

Each service uses its own `.env.docker` file. Example configuration:

```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=property_management
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
AUTH_SERVICE_URL=http://auth-service:3004
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Future Enhancements

- [ ] Add Redis for caching and session management
- [ ] Implement message queue (RabbitMQ/Kafka) for async communication
- [ ] Add payment integration for bookings
- [ ] Implement email notifications
- [ ] Add Swagger/OpenAPI documentation
- [ ] Expand test coverage to 80%+
- [ ] Add integration tests
- [ ] Implement monitoring and logging (Prometheus/Grafana)

---

## Author

**Mohammadreza Ghadarjani**  
Backend Developer  

📧 m.reza.ghadarjani@gmail.com  
🐙 [GitHub](https://github.com/mamzpy)  
📍 Turin, Italy

---

## License

This project is open source and available under the [MIT License](LICENSE).
