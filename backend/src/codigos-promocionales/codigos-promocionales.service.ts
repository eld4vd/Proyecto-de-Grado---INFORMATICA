import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCodigoPromocionalDto } from './dto/create-codigo-promocional.dto';
import { CodigoPromocional } from '@prisma/client';
import { UpdateCodigoPromocionalDto } from './dto/update-codigo-promocional.dto';

@Injectable()
export class CodigosPromocionalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateCodigoPromocionalDto) {
    const fechaExpiracion = this.parseFechaExpiracion(createDto.fechaExpiracion);

    if (createDto.esPorcentaje && createDto.descuento > 100) {
      throw new BadRequestException(
        'El descuento porcentual no puede ser mayor a 100%',
      );
    }

    if (fechaExpiracion && fechaExpiracion <= new Date()) {
      throw new BadRequestException(
        'La fecha de expiración debe ser posterior a la fecha actual',
      );
    }

    const existe = await this.prisma.codigoPromocional.findUnique({
      where: { codigo: createDto.codigo },
    });

    if (existe) {
      throw new BadRequestException('El código promocional ya existe');
    }

    return this.prisma.codigoPromocional.create({
      data: {
        ...createDto,
        fechaExpiracion,
      },
    });
  }

  async findAll() {
    return this.prisma.codigoPromocional.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const codigo = await this.prisma.codigoPromocional.findUnique({
      where: { id },
    });

    if (!codigo) {
      throw new NotFoundException('Código promocional no encontrado');
    }

    return codigo;
  }

  async update(id: string, updateDto: UpdateCodigoPromocionalDto) {
    const fechaExpiracion = this.parseFechaExpiracion(updateDto.fechaExpiracion);

    const existing = await this.prisma.codigoPromocional.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Código promocional no encontrado');
    }

    if (updateDto.codigo && updateDto.codigo !== existing.codigo) {
      const duplicatedCode = await this.prisma.codigoPromocional.findUnique({
        where: { codigo: updateDto.codigo },
      });

      if (duplicatedCode) {
        throw new BadRequestException('El código promocional ya existe');
      }
    }

    const descuentoFinal = updateDto.descuento ?? Number(existing.descuento);
    const esPorcentajeFinal = updateDto.esPorcentaje ?? existing.esPorcentaje;

    if (esPorcentajeFinal && descuentoFinal > 100) {
      throw new BadRequestException(
        'El descuento porcentual no puede ser mayor a 100%',
      );
    }

    if (fechaExpiracion && fechaExpiracion <= new Date()) {
      throw new BadRequestException(
        'La fecha de expiración debe ser posterior a la fecha actual',
      );
    }

    return this.prisma.codigoPromocional.update({
      where: { id },
      data: {
        ...updateDto,
        fechaExpiracion,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.codigoPromocional.delete({
      where: { id },
    });
  }

  async validarCodigo(codigo: string, subtotal?: number) {
    const promo = await this.prisma.codigoPromocional.findUnique({
      where: { codigo },
    });

    if (!promo) {
      throw new NotFoundException('Código promocional no válido');
    }

    if (!promo.activo) {
      throw new BadRequestException('El código promocional está inactivo');
    }

    if (promo.fechaExpiracion && new Date() > promo.fechaExpiracion) {
      throw new BadRequestException('El código promocional ha expirado');
    }

    if (promo.usosMaximos && promo.usosActuales >= promo.usosMaximos) {
      throw new BadRequestException('El código promocional ha alcanzado su límite de usos');
    }

    const descuentoAplicado =
      typeof subtotal === 'number' && subtotal >= 0
        ? this.calcularDescuento(promo, subtotal)
        : null;

    return {
      id: promo.id,
      codigo: promo.codigo,
      descuento: Number(promo.descuento),
      esPorcentaje: promo.esPorcentaje,
      descuentoAplicado,
    };
  }

  private calcularDescuento(promo: CodigoPromocional, subtotal: number): number {
    const descuentoBase = promo.esPorcentaje
      ? subtotal * (Number(promo.descuento) / 100)
      : Number(promo.descuento);

    return Math.max(0, Math.min(descuentoBase, subtotal));
  }

  private parseFechaExpiracion(fecha?: string): Date | undefined {
    if (!fecha) return undefined;

    const parsed = new Date(fecha);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(
        'La fecha de expiración no tiene un formato válido',
      );
    }

    return parsed;
  }
}
