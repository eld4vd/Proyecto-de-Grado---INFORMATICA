import { getBrandsCached } from '../lib/server-api';
import { BrandsCarousel } from './ClientCarousels';

export default async function HomeBrandsSection() {
  const brands = await getBrandsCached();
  const carouselBrands = brands.map((brand) => ({
    id: brand.id,
    nombre: brand.nombre,
    imagenUrl: brand.logoUrl,
    activo: brand.activo,
  }));

  return <BrandsCarousel initialBrands={carouselBrands.length > 0 ? carouselBrands : undefined} />;
}
