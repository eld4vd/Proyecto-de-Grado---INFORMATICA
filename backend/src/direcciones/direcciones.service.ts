import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDireccionDto } from './dto/create-direccion.dto';
import { UpdateDireccionDto } from './dto/update-direccion.dto';

@Injectable()
export class DireccionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDireccionDto: CreateDireccionDto) {
    // Verificar que el cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: createDireccionDto.clienteId },
    });
    if (!cliente || cliente.deletedAt) {
      throw new NotFoundException('El cliente especificado no existe');
    }

    // Si es predeterminada, quitar predeterminada de otras
    if (createDireccionDto.esPredeterminada) {
      await this.prisma.direccion.updateMany({
        where: {
          clienteId: createDireccionDto.clienteId,
          esPredeterminada: true,
        },
        data: { esPredeterminada: false },
      });
    }

    return this.prisma.direccion.create({
      data: {
        clienteId: createDireccionDto.clienteId,
        calle: createDireccionDto.calle,
        ciudad: createDireccionDto.ciudad,
        departamento: createDireccionDto.departamento,
        codigoPostal: createDireccionDto.codigoPostal,
        esPredeterminada: createDireccionDto.esPredeterminada ?? false,
      },
    });
  }

  async findAll() {
    return this.prisma.direccion.findMany({
      where: { deletedAt: null },
      include: {
        cliente: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCliente(clienteId: string) {
    return this.prisma.direccion.findMany({
      where: { clienteId, deletedAt: null },
      orderBy: { esPredeterminada: 'desc' },
    });
  }

  async findOne(id: string) {
    const direccion = await this.prisma.direccion.findUnique({
      where: { id },
      include: {
        cliente: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
      },
    });

    if (!direccion || direccion.deletedAt) {
      throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
    }

    return direccion;
  }

  async update(id: string, updateDireccionDto: UpdateDireccionDto) {
    const existing = await this.prisma.direccion.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
    }

    // Si se marca como predeterminada, quitar predeterminada de otras
    if (updateDireccionDto.esPredeterminada) {
      await this.prisma.direccion.updateMany({
        where: {
          clienteId: existing.clienteId,
          id: { not: id },
          esPredeterminada: true,
        },
        data: { esPredeterminada: false },
      });
    }

    return this.prisma.direccion.update({
      where: { id },
      data: updateDireccionDto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.direccion.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
    }

    // Soft delete
    return this.prisma.direccion.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Formatea una dirección como texto para snapshot en órdenes
   */
  formatDireccionTexto(direccion: {
    calle: string;
    ciudad: string;
    departamento: string;
    codigoPostal?: string | null;
  }): string {
    const parts = [direccion.calle, direccion.ciudad, direccion.departamento];
    if (direccion.codigoPostal) {
      parts.push(`CP: ${direccion.codigoPostal}`);
    }
    return parts.join(', ');
  }
}
