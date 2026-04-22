import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const logger = new Logger('Bootstrap');

  // Graceful shutdown hooks (SIGTERM/SIGINT)
  app.enableShutdownHooks();

  // Seguridad: cabeceras HTTP con Helmet
  app.use(helmet());

  // Compresion: gzip/deflate/brotli para respuestas HTTP (>1KB)
  app.use(compression({ threshold: 1024 }));

  // Cookie parser (requerido para auth con cookies httpOnly)
  app.use(cookieParser());

  // Prefijo global para la API
  app.setGlobalPrefix('api');

  // Configuración de CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log('\n==========================================================');
  console.log(`🚀 Backend E-commerce corriendo en: http://localhost:${port}/api`);
  console.log('==========================================================');
  console.log(`📚 Endpoints disponibles:`);
  console.log(`   🔐 POST /api/auth/register     → Registro`);
  console.log(`   🔐 POST /api/auth/login        → Login cliente`);
  console.log(`   🔐 POST /api/auth/admin/login  → Login admin`);
  console.log(`   🔐 POST /api/auth/refresh      → Renovar token`);
  console.log(`   🔐 POST /api/auth/logout       → Cerrar sesión`);
  console.log(`   🔐 GET  /api/auth/profile      → Perfil usuario`);
  console.log(`   - GET  /api/categorias`);
  console.log(`   - GET  /api/marcas`);
  console.log(`   - GET  /api/productos`);
  console.log(`   - GET  /api/clientes`);
  console.log(`   - GET  /api/carritos`);
  console.log(`   - GET  /api/ordenes`);
  console.log(`   - GET  /api/pagos`);
  console.log(`   - GET  /api/envios`);
  console.log(`   - GET  /api/resenas`);
  console.log('==========================================================\n');
}
bootstrap();

