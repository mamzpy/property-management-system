# ---------- BUILDER STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps for API gateway only
COPY package*.json ./
RUN npm install

# Copy API gateway source
COPY . .

# Build
RUN npm run build

# ---------- RUNTIME STAGE ----------
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]