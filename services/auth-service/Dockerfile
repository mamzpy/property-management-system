# ---------- BUILDER STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy workspace package files BEFORE install
COPY services/auth-service/package*.json ./services/auth-service/
COPY services/api-gateway/package*.json ./services/api-gateway/
COPY services/booking-service/package*.json ./services/booking-service/
COPY services/property-service/package*.json ./services/property-service/
COPY services/tenant-service/package*.json ./services/tenant-service/
COPY services/maintenance-service/package*.json ./services/maintenance-service/
COPY shared/package*.json ./shared/

# Install workspace deps
RUN npm install

# Copy source code
COPY services/auth-service ./services/auth-service
COPY shared ./shared

# Build auth-service
WORKDIR /app/services/auth-service
RUN npm run build

# ---------- RUNTIME STAGE ----------
FROM node:22-alpine

RUN apk add --no-cache curl

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy workspace package file
COPY services/auth-service/package*.json ./services/auth-service/

# Install production deps
RUN npm install --omit=dev

# Copy built output
COPY --from=builder /app/services/auth-service/dist ./services/auth-service/dist

WORKDIR /app/services/auth-service

CMD ["node", "dist/services/auth-service/src/main.js"]