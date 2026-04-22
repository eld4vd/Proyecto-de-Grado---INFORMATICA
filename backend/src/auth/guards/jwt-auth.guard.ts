import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators';
import { JwtPayload, AuthenticatedUser } from '../interfaces';

/**
 * Guard de autenticación JWT con soporte para cookies httpOnly
 *
 * Características 2025/2026:
 * - Lee access_token desde cookie httpOnly (más seguro)
 * - Fallback a header Authorization: Bearer (para APIs)
 * - Soporte para rutas públicas con @Public()
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si la ruta es pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token de acceso no proporcionado');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      // Verificar que sea un access token
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Tipo de token inválido');
      }

      // Adjuntar usuario al request
      const user: AuthenticatedUser = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      request['user'] = user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Token expirado o inválido
      const errorMessage =
        (error as Error)?.name === 'TokenExpiredError'
          ? 'Token expirado'
          : 'Token inválido';

      throw new UnauthorizedException(errorMessage);
    }
  }

  /**
   * Extrae el token de la cookie o del header Authorization
   * Prioridad: Cookie > Header (las cookies son más seguras)
   */
  private extractToken(request: Request): string | undefined {
    // 1. Intentar extraer de cookie httpOnly (recomendado)
    const cookieToken = request.cookies?.['access_token'];
    if (cookieToken) {
      return cookieToken;
    }

    // 2. Fallback: Header Authorization (para APIs móviles, testing, etc.)
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    return undefined;
  }
}
