import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { generateSlug } from '../common/utils/transforms.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductosService {
  private readonly logger = new Logger(ProductosService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductoDto: CreateProductoDto) {
    const slug =
      createProductoDto.slug || generateSlug(createProductoDto.nombre);

    // Verificar que el SKU no exista
    const existingSku = await this.prisma.producto.findUnique({
      where: { sku: createProductoDto.sku },
    });
    if (existingSku) {
      throw new ConflictException(
        `Ya existe un producto con el SKU: ${createProductoDto.sku}`,
      );
    }

    // Verificar que el slug no exista
    const existingSlug = await this.prisma.producto.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new ConflictException(`Ya existe un producto con el slug: ${slug}`);
    }

    // Verificar marca si se proporciona
    if (createProductoDto.marcaId) {
      const marca = await this.prisma.marca.findUnique({
        where: { id: createProductoDto.marcaId },
      });
      if (!marca) {
        throw new NotFoundException('La marca especificada no existe');
      }
    }

    // Verificar categorías si se proporcionan
    if (createProductoDto.categoriasIds?.length) {
      const categorias = await this.prisma.categoria.findMany({
        where: { id: { in: createProductoDto.categoriasIds } },
      });
      if (categorias.length !== createProductoDto.categoriasIds.length) {
        throw new NotFoundException('Una o más categorías no existen');
      }
    }

    return this.prisma.producto.create({
      data: {
        sku: createProductoDto.sku,
        nombre: createProductoDto.nombre,
        slug,
        descripcion: createProductoDto.descripcion,
        marcaId: createProductoDto.marcaId,
        precio: new Prisma.Decimal(createProductoDto.precio),
        ...(createProductoDto.precioOferta != null && {
          precioOferta: new Prisma.Decimal(createProductoDto.precioOferta),
        }),
        stock: createProductoDto.stock ?? 0,
        activo: createProductoDto.activo ?? true,
        destacado: createProductoDto.destacado ?? false,
        // Crear relaciones con categorías
        productoCategorias: createProductoDto.categoriasIds?.length
          ? {
              create: createProductoDto.categoriasIds.map((categoriaId) => ({
                categoriaId,
              })),
            }
          : undefined,
        // Crear imágenes
        imagenes: createProductoDto.imagenes?.length
          ? {
              create: createProductoDto.imagenes.map((img, index) => ({
                url: img.url,
                esPrincipal: img.esPrincipal ?? index === 0,
                orden: img.orden ?? index,
              })),
            }
          : undefined,
        // Crear especificaciones
        especificaciones: createProductoDto.especificaciones?.length
          ? {
              create: createProductoDto.especificaciones.map((spec) => ({
                nombre: spec.nombre,
                valor: spec.valor,
              })),
            }
          : undefined,
      },
      include: {
        marca: true,
        productoCategorias: { include: { categoria: true } },
        imagenes: { orderBy: { orden: 'asc' } },
        especificaciones: true,
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    search?: string;
    categoriaId?: string;
    marcaId?: string;
    destacado?: boolean;
    activo?: boolean;
    enOferta?: boolean;
    precioMin?: number;
    precioMax?: number;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
  }) {
    const {
      skip = 0,
      take = 20,
      search,
      categoriaId,
      marcaId,
      destacado,
      activo,
      enOferta,
      precioMin,
      precioMax,
      orderBy = 'createdAt',
      orderDir = 'desc',
    } = params || {};

    const where: Prisma.ProductoWhereInput = {
      deletedAt: null,
      ...(activo !== undefined && { activo }),
      ...(destacado !== undefined && { destacado }),
      ...(enOferta !== undefined &&
        (enOferta
          ? { precioOferta: { not: null }, stock: { gt: 0 } }
          : { precioOferta: null })),
      ...(marcaId && { marcaId }),
      ...(categoriaId && {
        productoCategorias: {
          some: { categoriaId },
        },
      }),
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { descripcion: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(precioMin !== undefined || precioMax !== undefined
        ? {
            precio: {
              ...(precioMin !== undefined && { gte: precioMin }),
              ...(precioMax !== undefined && { lte: precioMax }),
            },
          }
        : {}),
    };

    const [productos, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        skip,
        take,
        include: {
          marca: true,
          imagenes: { where: { esPrincipal: true }, take: 1 },
          productoCategorias: {
            include: {
              categoria: {
                include: { categoriaPadre: true },
              },
            },
          },
          _count: { select: { resenas: true } },
        },
        orderBy: { [orderBy]: orderDir },
      }),
      this.prisma.producto.count({ where }),
    ]);

    return {
      data: productos,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        marca: true,
        productoCategorias: { include: { categoria: true } },
        imagenes: { orderBy: { orden: 'asc' } },
        especificaciones: true,
        resenas: {
          where: { deletedAt: null, esAprobado: true },
          include: { cliente: { select: { nombre: true, apellido: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { resenas: true } },
      },
    });

    if (!producto || producto.deletedAt) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  }

  async findBySlug(slug: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { slug },
      include: {
        marca: true,
        productoCategorias: {
          include: {
            categoria: {
              include: { categoriaPadre: true },
            },
          },
        },
        imagenes: { orderBy: { orden: 'asc' } },
        especificaciones: true,
        resenas: {
          where: { deletedAt: null, esAprobado: true },
          include: { cliente: { select: { nombre: true, apellido: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { resenas: true } },
      },
    });

    if (!producto || producto.deletedAt) {
      throw new NotFoundException(`Producto con slug ${slug} no encontrado`);
    }

    return producto;
  }

  // Método unificado: busca por ID (UUID) o por slug automáticamente
  async findByIdOrSlug(identifier: string) {
    // Regex para detectar si es un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(identifier)) {
      // Es un UUID, buscar por ID
      return this.findOne(identifier);
    } else {
      // Es un slug, buscar por slug
      return this.findBySlug(identifier);
    }
  }

  async findDestacados(take = 8) {
    return this.prisma.producto.findMany({
      where: { deletedAt: null, activo: true, destacado: true },
      include: {
        marca: true,
        imagenes: { where: { esPrincipal: true }, take: 1 },
        productoCategorias: {
          include: {
            categoria: {
              include: { categoriaPadre: true },
            },
          },
        },
      },
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Búsqueda rápida para el header - devuelve datos mínimos
  async quickSearch(query: string) {
    if (!query || query.length < 2) return [];

    const productos = await this.prisma.producto.findMany({
      where: {
        activo: true,
        deletedAt: null,
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { descripcion: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { marca: { nombre: { contains: query, mode: 'insensitive' } } },
          {
            productoCategorias: {
              some: {
                categoria: {
                  nombre: { contains: query, mode: 'insensitive' },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        nombre: true,
        slug: true,
        precio: true,
        imagenes: {
          where: { esPrincipal: true },
          take: 1,
          select: { url: true },
        },
        marca: { select: { nombre: true } },
        productoCategorias: {
          take: 1,
          select: {
            categoria: { select: { nombre: true } },
          },
        },
      },
      take: 8,
      orderBy: { nombre: 'asc' },
    });

    return productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      slug: p.slug,
      precio: Number(p.precio),
      imagen: p.imagenes[0]?.url || null,
      marca: p.marca?.nombre || null,
      categoria: p.productoCategorias[0]?.categoria?.nombre || null,
    }));
  }

  async update(id: string, updateProductoDto: UpdateProductoDto) {
    // Normalizar categoriaIds -> categoriasIds para compatibilidad
    if (
      (updateProductoDto as any).categoriaIds &&
      !updateProductoDto.categoriasIds
    ) {
      updateProductoDto.categoriasIds = (updateProductoDto as any).categoriaIds;
      delete (updateProductoDto as any).categoriaIds;
    }

    const existing = await this.prisma.producto.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    // Si se actualiza el slug, verificar que no exista otro con ese slug
    if (updateProductoDto.slug && updateProductoDto.slug !== existing.slug) {
      const existingSlug = await this.prisma.producto.findFirst({
        where: {
          slug: updateProductoDto.slug,
          id: { not: id },
        },
      });
      if (existingSlug) {
        throw new ConflictException(
          `Ya existe un producto con el slug: ${updateProductoDto.slug}`,
        );
      }
    }

    // Actualizar categorías si se proporcionan
    if (updateProductoDto.categoriasIds) {
      // Eliminar categorías actuales y agregar las nuevas
      await this.prisma.productoCategoria.deleteMany({
        where: { productoId: id },
      });
      await this.prisma.productoCategoria.createMany({
        data: updateProductoDto.categoriasIds.map((categoriaId) => ({
          productoId: id,
          categoriaId,
        })),
      });
    }

    // Actualizar imágenes si se proporcionan
    if (updateProductoDto.imagenes) {
      await this.prisma.imagenProducto.deleteMany({
        where: { productoId: id },
      });
      await this.prisma.imagenProducto.createMany({
        data: updateProductoDto.imagenes.map((img, index) => ({
          productoId: id,
          url: img.url,
          esPrincipal: img.esPrincipal ?? index === 0,
          orden: img.orden ?? index,
        })),
      });
    }

    // Actualizar especificaciones si se proporcionan
    if (updateProductoDto.especificaciones) {
      await this.prisma.especificacionProducto.deleteMany({
        where: { productoId: id },
      });
      await this.prisma.especificacionProducto.createMany({
        data: updateProductoDto.especificaciones.map((spec) => ({
          productoId: id,
          nombre: spec.nombre,
          valor: spec.valor,
        })),
      });
    }

    // Extraer campos que no van directamente a producto
    const { categoriasIds, imagenes, especificaciones, ...productoData } =
      updateProductoDto;

    return this.prisma.producto.update({
      where: { id },
      data: {
        ...productoData,
        ...(productoData.precio !== undefined && {
          precio: new Prisma.Decimal(productoData.precio),
        }),
        ...(productoData.precioOferta !== undefined && {
          precioOferta:
            productoData.precioOferta != null
              ? new Prisma.Decimal(productoData.precioOferta)
              : null,
        }),
      },
      include: {
        marca: true,
        productoCategorias: {
          include: {
            categoria: {
              include: { categoriaPadre: true },
            },
          },
        },
        imagenes: { orderBy: { orden: 'asc' } },
        especificaciones: true,
      },
    });
  }

  async adjustStock(id: string, adjustStockDto: AdjustStockDto) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto || producto.deletedAt) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    const newStock = producto.stock + adjustStockDto.cantidad;
    if (newStock < 0) {
      throw new BadRequestException(
        `Stock insuficiente. Stock actual: ${producto.stock}, ajuste solicitado: ${adjustStockDto.cantidad}`,
      );
    }

    return this.prisma.producto.update({
      where: { id },
      data: { stock: newStock },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.producto.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    // Soft delete
    return this.prisma.producto.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // === Métodos para imágenes ===
  async addImagen(
    productoId: string,
    data: { url: string; esPrincipal?: boolean; orden?: number },
  ) {
    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId },
    });
    if (!producto || producto.deletedAt) {
      throw new NotFoundException(
        `Producto con ID ${productoId} no encontrado`,
      );
    }

    // Si es principal, quitar principal de otras
    if (data.esPrincipal) {
      await this.prisma.imagenProducto.updateMany({
        where: { productoId, esPrincipal: true },
        data: { esPrincipal: false },
      });
    }

    return this.prisma.imagenProducto.create({
      data: {
        productoId,
        url: data.url,
        esPrincipal: data.esPrincipal ?? false,
        orden: data.orden ?? 0,
      },
    });
  }

  async removeImagen(imagenId: string) {
    const imagen = await this.prisma.imagenProducto.findUnique({
      where: { id: imagenId },
    });
    if (!imagen) {
      throw new NotFoundException(`Imagen con ID ${imagenId} no encontrada`);
    }

    return this.prisma.imagenProducto.delete({ where: { id: imagenId } });
  }

  // === Métodos para especificaciones ===
  async addEspecificacion(
    productoId: string,
    data: { nombre: string; valor: string },
  ) {
    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId },
    });
    if (!producto || producto.deletedAt) {
      throw new NotFoundException(
        `Producto con ID ${productoId} no encontrado`,
      );
    }

    return this.prisma.especificacionProducto.create({
      data: {
        productoId,
        nombre: data.nombre,
        valor: data.valor,
      },
    });
  }

  async removeEspecificacion(especificacionId: string) {
    const spec = await this.prisma.especificacionProducto.findUnique({
      where: { id: especificacionId },
    });
    if (!spec) {
      throw new NotFoundException(
        `Especificación con ID ${especificacionId} no encontrada`,
      );
    }

    return this.prisma.especificacionProducto.delete({
      where: { id: especificacionId },
    });
  }
}
