import type { Producto } from './types';

/**
 * Utilidades compartidas para productos.
 * Centraliza helpers usados en múltiples páginas/componentes.
 */

/** Devuelve la URL de la imagen principal (o null si no hay imágenes). */
export function getMainImage(producto: Producto): string | null {
  if (producto.imagenes && producto.imagenes.length > 0) {
    const principal = producto.imagenes.find(img => img.esPrincipal);
    return principal?.url || producto.imagenes[0].url;
  }
  return null;
}

/** Devuelve el nombre de la categoría, con padre si existe. */
export function getCategoryName(producto: Producto): string {
  if (producto.productoCategorias && producto.productoCategorias.length > 0) {
    const categoria = producto.productoCategorias[0].categoria;
    if (categoria.categoriaPadre) {
      return `${categoria.categoriaPadre.nombre} > ${categoria.nombre}`;
    }
    return categoria.nombre;
  }
  return 'Sin categoría';
}

/** Devuelve el slug de la categoría a partir del nombre. */
export function getCategorySlug(producto: Producto): string {
  if (producto.productoCategorias && producto.productoCategorias.length > 0) {
    const categoryName = producto.productoCategorias[0].categoria.nombre;
    return categoryName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
  return '';
}

/** Formatea un precio numérico o string en formato boliviano. */
export function formatPrice(precio: number | string): string {
  const num = typeof precio === 'string' ? parseFloat(precio) : precio;
  return num.toLocaleString('es-BO', { minimumFractionDigits: 2 });
}

/** Devuelve true si el producto tiene una oferta activa. */
export function hasOffer(product: Producto): boolean {
  if (product.precioOferta == null) return false;
  const oferta =
    typeof product.precioOferta === 'string'
      ? parseFloat(product.precioOferta)
      : product.precioOferta;
  const precio =
    typeof product.precio === 'string' ? parseFloat(product.precio) : product.precio;
  return oferta > 0 && oferta < precio;
}

/** Calcula el porcentaje de descuento entre precio original y precio oferta. */
export function getDiscountPercent(
  precio: number | string,
  precioOferta: number | string
): number {
  const original = typeof precio === 'string' ? parseFloat(precio) : precio;
  const oferta =
    typeof precioOferta === 'string' ? parseFloat(precioOferta) : precioOferta;
  if (original <= 0) return 0;
  return Math.round((1 - oferta / original) * 100);
}
