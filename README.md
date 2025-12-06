# Property Management System

A production-grade microservices platform for managing rental properties, tenants, bookings, and maintenance operations. Designed using NestJS, TypeScript, PostgreSQL, and Docker, following modern distributed system architecture principles.

## Overview
Architecture Diagram


                  ┌────────────────────────────┐
                  │        API Gateway          │
                  │          :3000              │
                  └──────────────┬──────────────┘
                                 │
      ┌──────────────┬───────────┴───────────┬──────────────┬──────────────┐
      │              │                       │              │              │
 ┌────▼────┐   ┌─────▼────┐           ┌──────▼────┐   ┌──────▼────┐   ┌────▼────┐
 │  Auth   │   │ Property │           │  Tenant    │   │Maintenance│   │ Booking │
 │ :3004   │   │ :3001    │           │ :3002      │   │ :3003     │   │ :3005   │
 └─────────┘   └──────────┘           └────────────┘   └───────────┘   └─────────┘
                                 Shared PostgreSQL DB :5432



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

Services communicate via REST and run inside Docker containers.

## Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (Admin, Tenant)
- Secure password hashing with bcrypt
- Gateway-level token validation

### Property Management

- Create, update, delete property listings
- Property availability tracking
- Admin-controlled access

### Booking Workflow

- Tenants can request bookings
- Administrators approve or reject requests
- Status mutations (Pending → Approved / Rejected)

### Maintenance Requests

- Tenants submit and track maintenance issues
- Administrators manage and update progress

### User & Tenant Management

- Full user registration flow
- Role assignment
- Automatic tenant record creation upon approved booking (planned extension)

## Technology Stack

- **Backend:** NestJS (TypeScript)
- **Database:** PostgreSQL + TypeORM
- **Security:** JWT, bcrypt
- **Communication:** REST, Axios
- **Containerization:** Docker & Docker Compose
- **Validation:** class-validator DTOs

## Installation and Setup

### Requirements

- Docker
- Docker Compose

### Steps

```bash
# Clone the repository
git clone https://github.com/mamzpy/property-management-system.git
cd property-management-system

# Start all services
docker-compose up --build
```

### Service Access

| Service | URL |
|---------|-----|
| API Gateway | http://localhost:3000 |
| Auth Service | http://localhost:3004 |
| Property Service | http://localhost:3001 |
| Tenant Service | http://localhost:3002 |
| Maintenance Service | http://localhost:3003 |
| Booking Service | http://localhost:3005 |
| PostgreSQL | localhost:5432 |

## API Summary

### Authentication

```http
POST /auth/register
POST /auth/login
GET  /auth/profile
```

### Properties

```http
GET    /properties
GET    /properties/:id
POST   /properties
PATCH  /properties/:id
DELETE /properties/:id
```

### Bookings

```http
POST   /bookings
GET    /bookings
GET    /bookings/pending
PATCH  /bookings/:id/approve
PATCH  /bookings/:id/reject
```

## Project Structure

```
property-management-system/
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── property-service/
│   ├── tenant-service/
│   ├── maintenance-service/
│   └── booking-service/
├── docker-compose.yml
└── README.md
```

## Design Patterns Used

- Microservices Architecture
- API Gateway Pattern
- DTO + Validation Layer
- Repository Pattern (TypeORM)
- Guard Pattern for authentication & authorization

## Development Guide

### Running a single service

```bash
cd services/auth-service
npm install
npm run start:dev
```

### Stopping services

```bash
docker-compose down
```

### Clean rebuild

```bash
docker-compose down -v
docker-compose up --build
```

## Database Schema Overview

- **users** — accounts, passwords, roles
- **properties** — physical rental units
- **tenants** — tenant profiles (linked to users)
- **maintenance_requests** — issues and repairs
- **bookings** — booking and approval workflow

## Security Practices

- JWT-based authentication
- Hashed passwords (bcrypt)
- Role-based route protection
- Validated input DTOs
- Isolated services running inside Docker

## Author

**Mohammadreza Ghadarjani** — Junior Backend Developer

- 📧 Email: m.reza.ghadarjani@gmail.com
- 💻 GitHub: [@mamzpy](https://github.com/mamzpy)
- 📍 Location: Turin, Italy

---
