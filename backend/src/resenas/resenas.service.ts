import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResenaDto } from './dto/create-resena.dto';
import { UpdateResenaDto } from './dto/update-resena.dto';

// Estados de orden que confirman una compra real (incluye compra recién creada)
const ESTADOS_COMPRA_VALIDA = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO'];

@Injectable()
export class ResenasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createResenaDto: CreateResenaDto) {
    // Verificar que el producto existe
    const producto = await this.prisma.producto.findUnique({
      where: { id: createResenaDto.productoId },
    });
    if (!producto || producto.deletedAt) {
      throw new NotFoundException('El producto especificado no existe');
    }

    // Verificar que el cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: createResenaDto.clienteId },
    });
    if (!cliente || cliente.deletedAt) {
      throw new NotFoundException('El cliente especificado no existe');
    }

    // Verificar que no exista ya una reseña del cliente para este producto
    const existingResena = await this.prisma.resena.findFirst({
      where: {
        productoId: createResenaDto.productoId,
        clienteId: createResenaDto.clienteId,
        deletedAt: null,
      },
    });
    if (existingResena) {
      throw new ConflictException(
        'Ya has dejado una reseña para este producto',
      );
    }

    // OBLIGATORIO: Verificar que el cliente compró el producto (orden pagada/enviada/entregada)
    const ordenConProducto = await this.prisma.orden.findFirst({
      where: {
        clienteId: createResenaDto.clienteId,
        estado: { in: ESTADOS_COMPRA_VALIDA as any },
        items: {
          some: { productoId: createResenaDto.productoId },
        },
      },
    });

    if (!ordenConProducto) {
      throw new ForbiddenException(
        'Solo puedes dejar una reseña si compraste este producto',
      );
    }

    return this.prisma.resena.create({
      data: {
        productoId: createResenaDto.productoId,
        clienteId: createResenaDto.clienteId,
        ordenId: ordenConProducto.id,
        calificacion: createResenaDto.calificacion,
        titulo: createResenaDto.titulo,
        comentario: createResenaDto.comentario,
        esVerificado: true, // Siempre verificado porque exigimos la compra
        esAprobado: true, // Se publica automáticamente, sin aprobación del admin
      },
      include: {
        producto: { select: { id: true, nombre: true, slug: true } },
        cliente: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }

  async findAll(params?: {
    productoId?: string;
    clienteId?: string;
    esAprobado?: boolean;
    esVerificado?: boolean;
  }) {
    const { productoId, clienteId, esAprobado, esVerificado } = params || {};

    return this.prisma.resena.findMany({
      where: {
        deletedAt: null,
        ...(productoId && { productoId }),
        ...(clienteId && { clienteId }),
        ...(esAprobado !== undefined && { esAprobado }),
        ...(esVerificado !== undefined && { esVerificado }),
      },
      include: {
        producto: { select: { id: true, nombre: true, slug: true } },
        cliente: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProducto(productoId: string, soloAprobadas = true) {
    return this.prisma.resena.findMany({
      where: {
        productoId,
        deletedAt: null,
        ...(soloAprobadas && { esAprobado: true }),
      },
      include: {
        cliente: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const resena = await this.prisma.resena.findUnique({
      where: { id },
      include: {
        producto: { select: { id: true, nombre: true, slug: true } },
        cliente: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    if (!resena || resena.deletedAt) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
    }

    return resena;
  }

  async update(id: string, updateResenaDto: UpdateResenaDto) {
    const existing = await this.prisma.resena.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
    }

    return this.prisma.resena.update({
      where: { id },
      data: updateResenaDto,
      include: {
        producto: { select: { id: true, nombre: true, slug: true } },
        cliente: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }

  async aprobar(id: string) {
    return this.update(id, { esAprobado: true });
  }

  async rechazar(id: string) {
    return this.update(id, { esAprobado: false });
  }

  async remove(id: string) {
    const existing = await this.prisma.resena.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
    }

    // Soft delete
    return this.prisma.resena.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Obtener estadísticas de reseñas de un producto
   */
  async getProductoStats(productoId: string) {
    const stats = await this.prisma.resena.aggregate({
      where: {
        productoId,
        deletedAt: null,
        esAprobado: true,
      },
      _avg: { calificacion: true },
      _count: { id: true },
    });

    // Distribución por calificación
    const distribucion = await this.prisma.resena.groupBy({
      by: ['calificacion'],
      where: {
        productoId,
        deletedAt: null,
        esAprobado: true,
      },
      _count: { id: true },
    });

    return {
      promedio: stats._avg.calificacion || 0,
      total: stats._count.id,
      distribucion: distribucion.reduce(
        (acc, item) => {
          acc[item.calificacion] = item._count.id;
          return acc;
        },
        {} as Record<number, number>,
      ),
    };
  }

  /**
   * Verificar si un cliente puede dejar reseña en un producto
   * Requisitos: haber comprado el producto y no haber reseñado ya
   */
  async puedeResenar(productoId: string, clienteId: string) {
    // Verificar si ya dejó reseña
    const existingResena = await this.prisma.resena.findFirst({
      where: {
        productoId,
        clienteId,
        deletedAt: null,
      },
    });

    if (existingResena) {
      return { puede: false, razon: 'Ya dejaste una reseña para este producto' };
    }

    // Verificar si compró el producto
    const ordenConProducto = await this.prisma.orden.findFirst({
      where: {
        clienteId,
        estado: { in: ESTADOS_COMPRA_VALIDA as any },
        items: {
          some: { productoId },
        },
      },
    });

    if (!ordenConProducto) {
      return { puede: false, razon: 'Debes comprar este producto para poder opinar' };
    }

    return { puede: true, razon: null };
  }
}
