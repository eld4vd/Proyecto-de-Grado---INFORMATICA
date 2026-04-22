/**
 * Tipos compartidos para el frontend
 * Basados en el schema de Prisma del backend
 */

// ==========================================
// CATÁLOGO
// ==========================================

export interface Marca {
  id: string;
  nombre: string;
  slug: string;
  logoUrl: string | null;
  activo: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagenUrl: string | null;
  activo: boolean;
  categoriaPadreId: string | null;
  categoriaPadre?: Categoria | null;
  subcategorias?: Categoria[];
  _count?: {
    productoCategorias: number;
  };
}

export interface ImagenProducto {
  id: string;
  url: string;
  esPrincipal: boolean;
  orden: number;
}

export interface EspecificacionProducto {
  id: string;
  nombre: string;
  valor: string;
}

export interface ProductoCategoria {
  categoria: Categoria;
}

export interface Producto {
  id: string;
  sku: string;
  codigoBarras?: string | null;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: number | string;
  precioOferta?: number | string | null;
  stock: number;
  activo: boolean;
  destacado: boolean;
  createdAt: string;
  marca?: Marca | null;
  marcaId?: string | null;
  imagenes?: ImagenProducto[];
  especificaciones?: EspecificacionProducto[];
  productoCategorias?: ProductoCategoria[];
}

// ==========================================
// RESPUESTAS PAGINADAS
// ==========================================

export interface PaginationMeta {
  total: number;
  skip: number;
  take: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ==========================================
// FILTROS DE PRODUCTOS
// ==========================================

export interface ProductFilters {
  search?: string;
  categoriaId?: string;
  marcaId?: string;
  precioMin?: number;
  precioMax?: number;
  destacado?: boolean;
  activo?: boolean;
  enOferta?: boolean;
  orderBy?: 'precio' | 'nombre' | 'createdAt';
  orderDir?: 'asc' | 'desc';
  skip?: number;
  take?: number;
}

// ==========================================
// RESEÑAS
// ==========================================

export interface Resena {
  id: string;
  productoId: string;
  clienteId: string;
  ordenId?: string | null;
  calificacion: number;
  titulo?: string | null;
  comentario?: string | null;
  esVerificado: boolean;
  esAprobado: boolean;
  createdAt: string;
  updatedAt: string;
  cliente?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  producto?: {
    id: string;
    nombre: string;
    slug: string;
  };
}

export interface ResenaStats {
  promedio: number;
  total: number;
  distribucion: Record<number, number>;
}
