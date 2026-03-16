# ---------- BUILDER STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

# 1) Maintenance-service deps
COPY services/maintenance-service/package*.json ./services/maintenance-service/
RUN cd services/maintenance-service && npm install

# 2) Maintenance-service source
COPY services/maintenance-service ./services/maintenance-service

# 3) Build
WORKDIR /app/services/maintenance-service
RUN npm run build

# ---------- RUNTIME STAGE ----------
FROM node:22-alpine

RUN apk add --no-cache curl

WORKDIR /app/services/maintenance-service

COPY --from=builder /app/services/maintenance-service/dist ./dist
COPY --from=builder /app/services/maintenance-service/package*.json ./

RUN npm install --omit=dev

ENV NODE_ENV=production

WORKDIR /app/services/maintenance-service/dist
CMD ["node", "main.js"]