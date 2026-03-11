# ---------- BUILDER STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

# 1) Root deps (for shared RabbitMQ module)
COPY package*.json ./
RUN npm install

# 2) Shared lib (@pms/shared/*)
COPY shared ./shared

# 3) Tenant-service deps
COPY services/tenant-service/package*.json ./services/tenant-service/
RUN cd services/tenant-service && npm install

# 4) Tenant-service source
COPY services/tenant-service ./services/tenant-service

# 5) Build tenant-service
WORKDIR /app/services/tenant-service
RUN npm run build

# ---------- RUNTIME STAGE ----------
FROM node:22-alpine

RUN apk add --no-cache curl

# We run the app FROM the service folder
WORKDIR /app/services/tenant-service

# Copy compiled code + package.json for this service
COPY --from=builder /app/services/tenant-service/dist ./dist
COPY --from=builder /app/services/tenant-service/package*.json ./

# Install only production deps
RUN npm install --omit=dev

ENV NODE_ENV=production

WORKDIR /app/services/tenant-service/dist
CMD ["node", "services/tenant-service/src/main.js"]