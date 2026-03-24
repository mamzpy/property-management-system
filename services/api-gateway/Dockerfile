# ---------- BUILDER STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy workspace package files BEFORE install
COPY services/api-gateway/package*.json ./services/api-gateway/
COPY services/auth-service/package*.json ./services/auth-service/
COPY services/booking-service/package*.json ./services/booking-service/
COPY services/property-service/package*.json ./services/property-service/
COPY services/tenant-service/package*.json ./services/tenant-service/
COPY services/maintenance-service/package*.json ./services/maintenance-service/
COPY shared/package*.json ./shared/

# Install workspace deps
RUN npm install

# Copy source code
COPY services/api-gateway ./services/api-gateway
COPY shared ./shared

# Build gateway
WORKDIR /app/services/api-gateway
RUN npm run build

# ---------- RUNTIME STAGE ----------
FROM node:22-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy workspace package file
COPY services/api-gateway/package*.json ./services/api-gateway/

# Install only prod deps for workspace
RUN npm install --omit=dev

# Copy built output
COPY --from=builder /app/services/api-gateway/dist ./services/api-gateway/dist

WORKDIR /app/services/api-gateway

EXPOSE 3000
CMD ["node", "dist/services/api-gateway/src/main.js"]