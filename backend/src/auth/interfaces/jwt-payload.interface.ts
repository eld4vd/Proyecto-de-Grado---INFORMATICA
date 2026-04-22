import { Role } from '../enums';

/**
 * Payload del JWT Access Token
 * Sigue estándares RFC 7519
 */
export interface JwtPayload {
  /** Subject: ID del usuario (UUID) */
  sub: string;

  /** Email del usuario */
  email: string;

  /** Rol del usuario */
  role: Role;

  /** Tipo de token */
  type: 'access' | 'refresh';

  /** Issued At: timestamp de creación */
  iat?: number;

  /** Expiration: timestamp de expiración */
  exp?: number;
}

/**
 * Usuario autenticado extraído del token
 * Se adjunta a request.user
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}
