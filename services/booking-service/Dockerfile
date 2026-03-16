# ---------- BUILDER STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

# 1) Root deps (for shared RabbitMQ / outbox stuff)
COPY package*.json ./
RUN npm install

# 2) Shared lib (@pms/shared/*)
COPY shared ./shared

# 3) Booking-service deps
COPY services/booking-service/package*.json ./services/booking-service/
RUN cd services/booking-service && npm install

# 4) Booking-service source
COPY services/booking-service ./services/booking-service

# 5) Build booking-service
WORKDIR /app/services/booking-service
RUN npm run build

# ---------- RUNTIME STAGE ----------
FROM node:22-alpine

RUN apk add --no-cache curl

WORKDIR /app/services/booking-service

COPY --from=builder /app/services/booking-service/dist ./dist
COPY --from=builder /app/services/booking-service/package*.json ./

RUN npm install --omit=dev

ENV NODE_ENV=production

WORKDIR /app/services/booking-service/dist
CMD ["node", "services/booking-service/src/main.js"]