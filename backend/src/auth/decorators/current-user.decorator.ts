import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces';

/**
 * Decorador para extraer el usuario autenticado del request
 * @example
 * // Obtener usuario completo
 * @CurrentUser() user: AuthenticatedUser
 *
 * @example
 * // Obtener solo el ID
 * @CurrentUser('id') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user) {
      return null;
    }

    // Si se especifica una propiedad, retornar solo esa
    if (data) {
      return user[data];
    }

    return user;
  },
);
