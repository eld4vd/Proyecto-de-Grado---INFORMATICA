# 🛒 SicaBit - Plataforma E-commerce (Proyecto de Grado)

Bienvenido al repositorio oficial del proyecto **SicaBit**, una plataforma de comercio electrónico moderna, escalable y robusta, desarrollada como Proyecto de Grado. 

Este sistema abarca desde la gestión de inventario y carrito de compras, hasta la integración de pagos, control de envíos y un panel de administración completo, apoyado además por un Chatbot con Inteligencia Artificial.

---

## 🚀 Tecnologías y Arquitectura

El proyecto está dividido en un ecosistema basado en microservicios/contenedores, utilizando el siguiente Stack tecnológico:

### **Frontend (Cliente y Panel Admin)**
- **Framework:** Next.js 14/15 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Características:** Server-Side Rendering (SSR), SEO optimizado, Panel de administración interactivo, integración de Chatbot.

### **Backend (API REST)**
- **Framework:** NestJS 11
- **Lenguaje:** TypeScript
- **ORM:** Prisma 7
- **Base de Datos:** PostgreSQL 16
- **Autenticación:** JWT (Access Tokens & Refresh Tokens)
- **IA:** Integración con GROQ AI para el Chatbot.

### **Infraestructura y DevOps**
- **Contenedores:** Docker & Docker Compose
- **Servidor Web:** Nginx (Reverse Proxy)
- **Seguridad:** Certbot (Certificados SSL automáticos de Let's Encrypt)
- **Despliegue:** Preparado para VPS (ej. DigitalOcean, AWS, Linode)

---

## 📋 Módulos Principales

1. **Gestión de Usuarios y Autenticación:** Registro, login, control de roles (Cliente vs. Admin).
2. **Catálogo de Productos:** Categorías, marcas, inventario, precios y ofertas.
3. **Proceso de Compra:** Carrito de compras, favoritos, validación de códigos promocionales, flujo de checkout.
4. **Órdenes y Envíos:** Seguimiento de pedidos, gestión de pagos y despachos.
5. **Interacción:** Reseñas de productos, asistente virtual (Chatbot con IA) para soporte al cliente.

---

## 🛠️ Requisitos Previos

Dependiendo de cómo desees ejecutar el proyecto, necesitarás:
- **Node.js** (v20 o v22 recomendada)
- **npm** (o yarn/pnpm)
- **Docker y Docker Compose** (para entornos Dockerizados y Producción)
- **PostgreSQL** (si decides NO usar Docker en local)

---

## 💻 Entorno 1: Desarrollo Local (Sin Docker)
*Ideal para desarrollar rápidamente, debugear código paso a paso y realizar pruebas en la terminal de tu IDE.*

### 1. Configurar la Base de Datos
Asegúrate de tener una instancia de PostgreSQL corriendo en tu máquina y crea una base de datos (por ejemplo, `tech`).

### 2. Configurar y Arrancar el Backend
```bash
cd backend

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# --> Abre .env y ajusta DATABASE_URL, JWT_SECRET, GROQ_API_KEY, etc.

# 3. Aplicar migraciones y generar cliente Prisma
npx prisma migrate dev
npx prisma generate
# (Opcional) Poblar la base de datos con datos de prueba
npm run prisma:seed

# 4. Iniciar el servidor en modo desarrollo
npm run start:dev
```
El backend estará disponible en `http://localhost:3001`.

### 3. Configurar y Arrancar el Frontend
```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local
# --> Asegúrate de que las URLs apunten al backend local (localhost:3001)

# 3. Iniciar la aplicación
npm run dev
```
El frontend estará disponible en `http://localhost:3000`.

---

## 🐳 Entorno 2: Desarrollo con Docker (Local)
*Ideal para pruebas de integración o si no quieres instalar PostgreSQL/Node directamente en tu máquina host. Levanta todo el stack con un comando.*

```bash
# 1. Ubícate en la raíz del proyecto
cd Proyecto-Grado

# 2. Configurar las variables de entorno para Docker
cp .env.docker.local.example .env.docker.local
# --> Abre .env.docker.local y configura GROQ_API_KEY y credenciales de BD si lo deseas.

# 3. Levantar los contenedores
docker compose --env-file .env.docker.local up -d --build

# 4. Ver los logs para asegurar que todo arrancó bien
docker compose --env-file .env.docker.local logs -f
```
- **Frontend:** Disponible en `http://localhost:3010` (por defecto según configuración).
- **Backend:** Disponible en `http://localhost:3001`.
- **Base de Datos:** Expuesta en el puerto `5433` de tu máquina host.

Para apagar el entorno:
```bash
docker compose --env-file .env.docker.local down
```

---

## 🌍 Entorno 3: Producción (VPS + Nginx + SSL)
*Guía para desplegar en un servidor real con nombre de dominio, certificados HTTPS y contenedores optimizados para producción.*

### 1. Preparar el Servidor
- Clona el repositorio en tu VPS.
- Asegúrate de que los puertos `80` (HTTP) y `443` (HTTPS) estén abiertos en el firewall.
- Apunta tu dominio (y subdominio `www`) a la IP de tu VPS en tu proveedor de DNS.

### 2. Configurar Variables de Producción
```bash
cd Proyecto-Grado

# Copiar el template de producción
cp .env.docker.prod.example .env.docker.prod
```
**Importante:** Edita `.env.docker.prod` con datos **REALES**:
- `DOMAIN`: Tu dominio (ej. `midominio.com`).
- `POSTGRES_PASSWORD`: Genera una contraseña segura.
- `JWT_SECRET` y `JWT_REFRESH_SECRET`: Genera tokens seguros (ej. `openssl rand -hex 64`).
- `GROQ_API_KEY`: Tu API Key real.
- `CERTBOT_EMAIL`: Tu correo para notificaciones de SSL.

### 3. Generar Certificados SSL y Levantar el Stack
El proyecto incluye un script de inicialización automático que se encarga de negociar el certificado con Let's Encrypt de manera segura antes de arrancar los servicios en modo producción.

```bash
# Dar permisos de ejecución al script si es necesario
chmod +x init-letsencrypt.sh

# Ejecutar el script
sudo ./init-letsencrypt.sh
```
*Este script levantará temporalmente Nginx para verificar el dominio, descargará los certificados Let's Encrypt y luego recargará todo con HTTPS activado.*

### 4. Ejecutar Migraciones en Producción
Una vez que la base de datos y el backend están corriendo, necesitas generar las tablas de la BD en producción:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.docker.prod --profile migrate up migrate
```

*(Opcional)* Si necesitas popular la base de datos con información inicial (seeds) en el VPS:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.docker.prod --profile seed up seed
```

El sistema ya debería estar 100% operativo en `https://tudominio.com`.

---

## 📦 Comandos Útiles de Prisma

Si realizas cambios en el `schema.prisma` durante el desarrollo:

```bash
# Dentro de la carpeta /backend

# Crear una nueva migración (guarda el historial de cambios)
npx prisma migrate dev --name descripcion_del_cambio

# Aplicar migraciones pendientes (se hace automático en render/prod)
npx prisma migrate deploy

# Abrir el explorador visual de base de datos
npx prisma studio
```

## 🔒 Consideraciones de Seguridad
- Archivos como `.env` y ficheros de logs están configurados en `.gitignore` y `.dockerignore` para nunca subirse al repositorio.
- Nunca compartas el archivo `.env.docker.prod` públicamente.
- En producción, la base de datos corre de manera aislada en la red interna de Docker (`internal`) y no expone el puerto 5432 al exterior, siendo accesible únicamente por el contenedor del backend.

---
*Desarrollado con ❤️ para el Proyecto de Grado - 2026*