import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { generateSlug } from '../common/utils/transforms.util';

@Injectable()
export class MarcasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMarcaDto: CreateMarcaDto) {
    const slug = createMarcaDto.slug || generateSlug(createMarcaDto.nombre);

    // Verificar que el slug no exista
    const existingSlug = await this.prisma.marca.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictException(`Ya existe una marca con el slug: ${slug}`);
    }

    return this.prisma.marca.create({
      data: {
        nombre: createMarcaDto.nombre,
        slug,
        logoUrl: createMarcaDto.logoUrl,
        activo: createMarcaDto.activo ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.marca.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { productos: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findAllActive() {
    return this.prisma.marca.findMany({
      where: { deletedAt: null, activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const marca = await this.prisma.marca.findUnique({
      where: { id },
      include: {
        productos: {
          where: { deletedAt: null, activo: true },
          include: {
            imagenes: { where: { esPrincipal: true } },
          },
        },
        _count: {
          select: { productos: true },
        },
      },
    });

    if (!marca || marca.deletedAt) {
      throw new NotFoundException(`Marca con ID ${id} no encontrada`);
    }

    return marca;
  }

  async findBySlug(slug: string) {
    const marca = await this.prisma.marca.findUnique({
      where: { slug },
      include: {
        productos: {
          where: { deletedAt: null, activo: true },
          include: {
            imagenes: { where: { esPrincipal: true } },
          },
        },
      },
    });

    if (!marca || marca.deletedAt) {
      throw new NotFoundException(`Marca con slug ${slug} no encontrada`);
    }

    return marca;
  }

  async update(id: string, updateMarcaDto: UpdateMarcaDto) {
    const existing = await this.prisma.marca.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Marca con ID ${id} no encontrada`);
    }

    // Si se actualiza el slug, verificar que no exista otro con ese slug
    if (updateMarcaDto.slug && updateMarcaDto.slug !== existing.slug) {
      const existingSlug = await this.prisma.marca.findFirst({
        where: {
          slug: updateMarcaDto.slug,
          id: { not: id },
        },
      });
      if (existingSlug) {
        throw new ConflictException(
          `Ya existe una marca con el slug: ${updateMarcaDto.slug}`,
        );
      }
    }

    return this.prisma.marca.update({
      where: { id },
      data: updateMarcaDto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.marca.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Marca con ID ${id} no encontrada`);
    }

    // Soft delete
    return this.prisma.marca.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
