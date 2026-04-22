import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums';

export const ROLES_KEY = 'roles';

/**
 * Decorador para especificar qué roles pueden acceder a un endpoint
 * @example @Roles(Role.ADMIN)
 * @example @Roles(Role.ADMIN, Role.CLIENTE)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
