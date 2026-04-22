# ===========================================
# FRONTEND - Dockerfile PRODUCCIÓN (Multi-stage)
# Next.js 16 con standalone output
# ===========================================

# ──────────────────────────────────────────
# STAGE 1: Dependencias
# ──────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./

# Instalar TODAS las dependencias (necesarias para el build)
RUN npm ci

# ──────────────────────────────────────────
# STAGE 2: Build
# ──────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar dependencias desde stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para el build (NEXT_PUBLIC_* se embeben en el bundle)
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
ARG BACKEND_URL=http://backend:3001

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV BACKEND_URL=$BACKEND_URL
ENV BACKEND_INTERNAL_URL=$BACKEND_URL

# Desactivar telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Build de producción (genera .next/standalone)
RUN npm run build

# ──────────────────────────────────────────
# STAGE 3: Runner (imagen final mínima)
# ──────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copiar archivos estáticos públicos
COPY --from=builder /app/public ./public

# Crear directorio .next con permisos correctos
RUN mkdir .next && chown nextjs:nodejs .next

# Copiar el servidor standalone y los archivos estáticos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar a usuario no-root
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Ejecutar el servidor standalone de Next.js
CMD ["node", "server.js"]
