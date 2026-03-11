# ---------- BUILDER STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

# 1) Root deps (for shared RabbitMQ module)
COPY package*.json ./
RUN npm install

# 2) Shared lib (@pms/shared/*)
COPY shared ./shared

# 3) Property-service deps
COPY services/property-service/package*.json ./services/property-service/
RUN cd services/property-service && npm install

# 4) Property-service source
COPY services/property-service ./services/property-service

# 5) Build property-service
WORKDIR /app/services/property-service
RUN npm run build

# ---------- RUNTIME STAGE ----------
FROM node:22-alpine

RUN apk add --no-cache curl

WORKDIR /app/services/property-service

COPY --from=builder /app/services/property-service/dist ./dist
COPY --from=builder /app/services/property-service/package*.json ./

RUN npm install --omit=dev

ENV NODE_ENV=production

WORKDIR /app/services/property-service/dist

CMD ["node", "services/property-service/src/main.js"]