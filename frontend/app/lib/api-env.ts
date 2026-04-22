/**
 * Resuelve URLs de backend/API en un solo lugar para evitar hardcodeos.
 */

const DEFAULT_BACKEND_ORIGIN = 'http://localhost:3001';
const DEFAULT_API_BASE_URL = `${DEFAULT_BACKEND_ORIGIN}/api`;

const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, '');

type EnvName = 'BACKEND_INTERNAL_URL' | 'BACKEND_URL' | 'NEXT_PUBLIC_API_URL';

const getNonEmptyEnv = (name: EnvName): string | null => {
  const rawValue = process.env[name];
  if (!rawValue) return null;

  const normalizedValue = rawValue.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const toBackendOriginFromApiBase = (apiBaseUrl: string): string => {
  const normalized = trimTrailingSlashes(apiBaseUrl);
  return normalized.endsWith('/api') ? normalized.slice(0, -4) : normalized;
};

const getBackendOriginFromEnvs = (): string | null => {
  const backendInternalUrl = getNonEmptyEnv('BACKEND_INTERNAL_URL');
  if (backendInternalUrl) {
    return trimTrailingSlashes(backendInternalUrl);
  }

  const backendUrl = getNonEmptyEnv('BACKEND_URL');
  if (backendUrl) {
    return trimTrailingSlashes(backendUrl);
  }

  const publicApiUrl = getNonEmptyEnv('NEXT_PUBLIC_API_URL');
  if (publicApiUrl) {
    return toBackendOriginFromApiBase(publicApiUrl);
  }

  return null;
};

export const getBackendOrigin = (): string => {
  return getBackendOriginFromEnvs() ?? DEFAULT_BACKEND_ORIGIN;
};

export const getApiBaseUrl = (): string => {
  const backendInternalUrl = getNonEmptyEnv('BACKEND_INTERNAL_URL');
  if (backendInternalUrl) {
    return `${trimTrailingSlashes(backendInternalUrl)}/api`;
  }

  const backendUrl = getNonEmptyEnv('BACKEND_URL');
  if (backendUrl) {
    return `${trimTrailingSlashes(backendUrl)}/api`;
  }

  const publicApiUrl = getNonEmptyEnv('NEXT_PUBLIC_API_URL');
  if (publicApiUrl) {
    return trimTrailingSlashes(publicApiUrl);
  }

  return DEFAULT_API_BASE_URL;
};