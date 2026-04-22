import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { EstadoPago, EstadoOrden, Prisma } from '@prisma/client';

@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(createPagoDto: CreatePagoDto) {
    // Verificar que la orden existe
    const orden = await this.prisma.orden.findUnique({
      where: { id: createPagoDto.ordenId },
    });
    if (!orden) {
      throw new NotFoundException('La orden especificada no existe');
    }
    if (orden.estado === EstadoOrden.CANCELADO) {
      throw new BadRequestException(
        'No se puede registrar pago en una orden cancelada',
      );
    }

    const pago = await this.prisma.pago.create({
      data: {
        ordenId: createPagoDto.ordenId,
        monto: new Prisma.Decimal(createPagoDto.monto),
        metodoPago: createPagoDto.metodoPago,
        transaccionId: createPagoDto.transaccionId,
        estado: EstadoPago.PENDIENTE,
      },
    });

    return pago;
  }

  async findAll() {
    return this.prisma.pago.findMany({
      include: {
        orden: {
          select: { id: true, numeroOrden: true, total: true, clienteId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByOrden(ordenId: string) {
    return this.prisma.pago.findMany({
      where: { ordenId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const pago = await this.prisma.pago.findUnique({
      where: { id },
      include: {
        orden: {
          select: { id: true, numeroOrden: true, total: true, clienteId: true },
        },
      },
    });

    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return pago;
  }

  async update(id: string, updatePagoDto: UpdatePagoDto) {
    const existing = await this.prisma.pago.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    const updateData: Record<string, unknown> = {};
    if (updatePagoDto.estado !== undefined) {
      updateData.estado = updatePagoDto.estado;
    }
    if (updatePagoDto.transaccionId !== undefined) {
      updateData.transaccionId = updatePagoDto.transaccionId;
    }

    // Si se aprueba el pago, registrar fecha
    if (updatePagoDto.estado === 'APROBADO') {
      updateData.fechaPago = new Date();
    }

    return this.prisma.$transaction(async (tx) => {
      const pago = await tx.pago.update({
        where: { id },
        data: updateData,
      });

      // Si el pago es aprobado, actualizar estado de la orden
      if (updatePagoDto.estado === 'APROBADO') {
        await tx.orden.update({
          where: { id: existing.ordenId },
          data: {
            estadoPago: EstadoPago.APROBADO,
            estado: EstadoOrden.PAGADO,
          },
        });
        this.logger.log(`Pago ${id} aprobado para orden ${existing.ordenId}`);
      }

      return pago;
    });
  }

  async aprobar(id: string, transaccionId?: string) {
    return this.update(id, {
      estado: 'APROBADO' as any,
      transaccionId,
    });
  }

  async rechazar(id: string) {
    const existing = await this.prisma.pago.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return this.prisma.$transaction(async (tx) => {
      const pago = await tx.pago.update({
        where: { id },
        data: { estado: EstadoPago.RECHAZADO },
      });

      await tx.orden.update({
        where: { id: existing.ordenId },
        data: { estadoPago: EstadoPago.RECHAZADO },
      });

      this.logger.warn(`Pago ${id} rechazado para orden ${existing.ordenId}`);
      return pago;
    });
  }
}
