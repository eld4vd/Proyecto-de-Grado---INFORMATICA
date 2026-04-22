# ===========================================
# BACKEND - Dockerfile PRODUCCIÓN (Multi-stage)
# NestJS 11 + Prisma 7
# ===========================================

# ──────────────────────────────────────────
# STAGE 1: Build completo
# ──────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar TODAS las dependencias (dev + prod, necesarias para build)
RUN npm ci

# Copiar código fuente completo
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar TypeScript a JavaScript (output en /dist)
RUN npm run build

# ──────────────────────────────────────────
# STAGE 2: Runner (imagen final mínima)
# ──────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat openssl

# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

# Copiar dependencias de producción (ya pruneadas)
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copiar aplicación compilada
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copiar archivos de configuración necesarios
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# Eliminar dependencias de desarrollo SOLO en la imagen final.
# Esto evita romper servicios que usan target=builder (migrate/seed con ts-node).
RUN npm prune --omit=dev

# Copiar Prisma schema + migraciones (para prisma migrate deploy)
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/prisma.config.ts ./

# Cambiar a usuario no-root
USER nestjs

EXPOSE 3001

# Ejecutar la aplicación compilada directamente con Node
CMD ["node", "dist/main.js"]
