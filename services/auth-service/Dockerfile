# ---------- BUILDER STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

# 1) Install deps for auth-service (context is already services/auth-service)
COPY package*.json ./
RUN npm install

# 2) Copy source code
COPY . .

# 3) Build Nest app
RUN npm run build

# ---------- RUNTIME STAGE ----------
FROM node:22-alpine

RUN apk add --no-cache curl

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Install only production deps
RUN npm install --omit=dev && npm cache clean --force

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]