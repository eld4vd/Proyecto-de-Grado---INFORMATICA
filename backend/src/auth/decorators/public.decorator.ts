import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador para marcar un endpoint como público (sin autenticación)
 * @example @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
