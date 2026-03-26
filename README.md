# 🏢 Property Management System

## 🚀 Production-Grade Microservices Backend

A scalable backend system for managing **rental properties, bookings, tenants, and maintenance workflows**.

---

## ⚙️ Tech Stack

**NestJS · TypeScript · PostgreSQL · RabbitMQ · Redis · Docker · AWS EC2**

---

## 🔗 Repository

👉 https://github.com/mamzpy/property-management-system

---

## 🌐 Live API

🔍 **Swagger UI**  
http://18.201.231.15:3000/api-docs  

---

### 🔐 Demo Credentials

- **Email:** `demo@pms.com`  
- **Password:** `Demo123!`  

**How to test:**
1. Login  
2. Copy JWT token  
3. Click **Authorize 🔒** in Swagger  
4. Test endpoints  

---

 🧠 Architecture
                     +------------------------+
                     |      API Gateway       |
                     |        (Nginx)         |
                     |         :3000          |
                     +-----------+------------+
                                 |
     +---------------------------+-----------------------------+
     |            |              |              |              |
 +--------+   +----------+   +---------+   +----------+   +-------------+
 |  Auth  |   | Property |   | Tenant  |   | Booking  |   | Maintenance |
 | :3004  |   |  :3001   |   | :3002   |   |  :3005   |   |   :3003     |
 +--------+   +----------+   +---------+   +----------+   +-------------+
     |            |              |              |               |
     +----------------------+-------------------+---------------+
                            |
                +-------------------------------+
                |        PostgreSQL Cluster     |
                |     (Dedicated DB per svc)    |
                +---------------+---------------+
                                |
          +---------------------+----------------------+
          |                                            |
   +---------------+                          +----------------+
   |     Redis     |                          |    RabbitMQ    |
   | (Caching &    |                          |   Event Bus    |
   |  Locking)     |                          +--------+-------+
   +---------------+                                   |
                                                       |
                                              +-------------------+
                                              |      Outbox       |
                                              |   (Booking Svc)   |
                                              +-------------------+
                                              
---

## 📦 Key Features

- Microservices architecture with **independent services and databases**  
- JWT authentication & **RBAC (Admin / Tenant roles)**  
- Event-driven communication using **RabbitMQ**  
- Booking workflow with **asynchronous processing**  
- **Outbox pattern** for reliable event publishing  
- **Redis distributed locking** to prevent double-booking  
- Correlation ID tracing across services  
- Dockerized deployment on AWS EC2  
- Swagger/OpenAPI for API testing  
- CI pipeline with GitHub Actions  

---

## 🔄 Booking Flow

Tenant creates booking → **pending**  
→ Event published (Outbox → RabbitMQ)  
→ Property & Tenant services react  
→ Admin approves → booking = **approved**, property updated  

---

## 🧪 Testing

- Unit tests with Jest  
- Basic integration testing  

---

## 🐳 Run Locally
git clone https://github.com/mamzpy/property-management-system
cd property-management-system
docker compose up --build

Swagger:
http://localhost:3000/api-docs
---

📁 Project Structure
property-management-system/
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── property-service/
│   ├── tenant-service/
│   ├── booking-service/
│   └── maintenance-service/
├── shared/
├── docker-compose.yml
├── package.json
└── README.md

---

👤Author
Mohammadreza Ghadarjani
Backend Developer
📧 m.reza.ghadarjani@gmail.com
🐙 https://github.com/mamzpy
📍 Turin, Italy


