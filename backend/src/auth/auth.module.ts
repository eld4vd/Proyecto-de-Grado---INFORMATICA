import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard, RolesGuard } from './guards';

/**
 * Módulo de autenticación y autorización
 *
 * Configuración:
 * - JWT con doble token (access + refresh)
 * - Rate limiting global (protección DDoS/brute force)
 * - Guards globales para auth
 *
 * Variables de entorno requeridas:
 * - JWT_SECRET: secreto para access token
 * - JWT_REFRESH_SECRET: secreto para refresh token
 */
@Module({
  imports: [
    // JWT Module (global)
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m', // Default, se sobreescribe en el service
        },
      }),
    }),

    // Rate Limiting Module (protección brute force)
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto (global)
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,

    // Rate Limiter global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // Exportar guards para uso manual
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
