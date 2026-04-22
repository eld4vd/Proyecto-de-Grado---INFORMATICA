/**
 * Librería de autenticación para el frontend
 * Maneja login, logout, refresh y verificación de sesión
 */

export type UserRole = 'cliente' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  nombre?: string;
  apellido?: string;
  clienteId?: string;
  telefono?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login de cliente
 */
export async function loginCliente(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Importante para las cookies
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al iniciar sesión');
  }

  return data;
}

/**
 * Login de administrador
 */
export async function loginAdmin(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch('/api/auth/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al iniciar sesión');
  }

  return data;
}

/**
 * Cerrar sesión
 */
export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * Renovar access token usando refresh token
 */
export async function refreshToken(): Promise<AuthResponse> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al renovar sesión');
  }

  return data;
}

/**
 * Obtener perfil del usuario autenticado
 */
export async function getProfile(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      // Intentar refresh si el access token expiró
      if (response.status === 401) {
        try {
          await refreshToken();
          // Reintentar después del refresh
          const retryResponse = await fetch('/api/auth/profile', {
            method: 'GET',
            credentials: 'include',
          });
          if (retryResponse.ok) {
            return await retryResponse.json();
          }
        } catch {
          // Limpiar cookies rotas/expiradas para evitar loops de redirección.
          try {
            await logout();
          } catch {
            // Ignorar errores de cleanup
          }
          return null;
        }
      }
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Verificar si el usuario está autenticado
 */
export async function checkAuth(): Promise<{ authenticated: boolean; user?: User }> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      // Intentar refresh
      if (response.status === 401) {
        try {
          const refreshResult = await refreshToken();
          if (refreshResult.success && refreshResult.user) {
            return { authenticated: true, user: refreshResult.user };
          }
        } catch {
          try {
            await logout();
          } catch {
            // Ignorar errores de cleanup
          }
          return { authenticated: false };
        }
      }
      return { authenticated: false };
    }

    return await response.json();
  } catch {
    return { authenticated: false };
  }
}

/**
 * Verificar si el usuario es admin
 */
export async function checkAdminAuth(): Promise<{ isAdmin: boolean; user?: User }> {
  const auth = await checkAuth();
  
  if (auth.authenticated && auth.user?.role === 'admin') {
    return { isAdmin: true, user: auth.user };
  }
  
  return { isAdmin: false };
}
