/**
 * Utilidades de transformación para DTOs
 * Estandariza los textos recortando espacios y compatibilizando tipos
 */

/**
 * Transforma un valor a string recortado, devuelve string vacío si no es válido
 */
export const toTrimmedString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString().trim();
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return '';
};

/**
 * Variante que devuelve null cuando no hay contenido aprovechable
 */
export const toTrimmedStringOrNull = (value: unknown): string | null => {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString().trim();
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return null;
};

/**
 * Genera un slug a partir de un texto
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .replace(/^-|-$/g, ''); // Quitar guiones al inicio y fin
};

/**
 * Genera un número de orden único
 */
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * Transforma un valor a número entero o null
 */
export const toIntOrNull = (value: unknown): number | null => {
  if (value === undefined || value === null) {
    return null;
  }
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Transforma un valor a número decimal o null
 */
export const toDecimalOrNull = (value: unknown): number | null => {
  if (value === undefined || value === null) {
    return null;
  }
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? null : parsed;
};
