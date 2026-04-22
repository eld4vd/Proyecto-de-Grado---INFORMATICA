import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { generateSlug } from '../common/utils/transforms.util';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    // Generar slug si no se proporciona
    const slug =
      createCategoriaDto.slug || generateSlug(createCategoriaDto.nombre);

    // Verificar que el slug no exista
    const existingSlug = await this.prisma.categoria.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictException(
        `Ya existe una categoría con el slug: ${slug}`,
      );
    }

    // Verificar categoría padre si se proporciona
    if (createCategoriaDto.categoriaPadreId) {
      const categoriaPadre = await this.prisma.categoria.findUnique({
        where: { id: createCategoriaDto.categoriaPadreId },
      });
      if (!categoriaPadre) {
        throw new NotFoundException('La categoría padre no existe');
      }
    }

    return this.prisma.categoria.create({
      data: {
        nombre: createCategoriaDto.nombre,
        slug,
        descripcion: createCategoriaDto.descripcion,
        categoriaPadreId: createCategoriaDto.categoriaPadreId,
        imagenUrl: createCategoriaDto.imagenUrl,
        activo: createCategoriaDto.activo ?? true,
      },
      include: {
        categoriaPadre: true,
        subcategorias: true,
      },
    });
  }

  async findAll() {
    return this.prisma.categoria.findMany({
      where: { deletedAt: null },
      include: {
        categoriaPadre: true,
        subcategorias: {
          where: { deletedAt: null },
        },
        _count: {
          select: { productoCategorias: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findAllActive() {
    return this.prisma.categoria.findMany({
      where: { deletedAt: null, activo: true },
      include: {
        subcategorias: {
          where: { deletedAt: null, activo: true },
          include: {
            _count: {
              select: {
                productoCategorias: {
                  where: {
                    producto: { deletedAt: null, activo: true },
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            productoCategorias: {
              where: {
                producto: { deletedAt: null, activo: true },
              },
            },
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: {
        categoriaPadre: true,
        subcategorias: {
          where: { deletedAt: null },
        },
        productoCategorias: {
          include: {
            producto: {
              include: {
                imagenes: { where: { esPrincipal: true } },
              },
            },
          },
        },
      },
    });

    if (!categoria || categoria.deletedAt) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return categoria;
  }

  async findBySlug(slug: string) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { slug },
      include: {
        subcategorias: {
          where: { deletedAt: null, activo: true },
        },
        productoCategorias: {
          where: {
            producto: { deletedAt: null, activo: true },
          },
          include: {
            producto: {
              include: {
                imagenes: { where: { esPrincipal: true } },
                marca: true,
              },
            },
          },
        },
      },
    });

    if (!categoria || categoria.deletedAt) {
      throw new NotFoundException(`Categoría con slug ${slug} no encontrada`);
    }

    return categoria;
  }

  async update(id: string, updateCategoriaDto: UpdateCategoriaDto) {
    // Verificar que exista
    const existing = await this.prisma.categoria.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    // Si se actualiza el slug, verificar que no exista otro con ese slug
    if (updateCategoriaDto.slug && updateCategoriaDto.slug !== existing.slug) {
      const existingSlug = await this.prisma.categoria.findFirst({
        where: {
          slug: updateCategoriaDto.slug,
          id: { not: id },
        },
      });
      if (existingSlug) {
        throw new ConflictException(
          `Ya existe una categoría con el slug: ${updateCategoriaDto.slug}`,
        );
      }
    }

    // Verificar categoría padre si se proporciona
    if (updateCategoriaDto.categoriaPadreId) {
      if (updateCategoriaDto.categoriaPadreId === id) {
        throw new ConflictException(
          'Una categoría no puede ser su propia categoría padre',
        );
      }
      const categoriaPadre = await this.prisma.categoria.findUnique({
        where: { id: updateCategoriaDto.categoriaPadreId },
      });
      if (!categoriaPadre) {
        throw new NotFoundException('La categoría padre no existe');
      }
    }

    return this.prisma.categoria.update({
      where: { id },
      data: updateCategoriaDto,
      include: {
        categoriaPadre: true,
        subcategorias: true,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.categoria.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    // Soft delete
    return this.prisma.categoria.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
