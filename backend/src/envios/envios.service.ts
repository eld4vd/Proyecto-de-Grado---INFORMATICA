import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { UpdateEnvioDto, EstadoEnvioEnum } from './dto/update-envio.dto';
import { EstadoEnvio, EstadoOrden } from '@prisma/client';

@Injectable()
export class EnviosService {
  private readonly logger = new Logger(EnviosService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(createEnvioDto: CreateEnvioDto) {
    // Verificar que la orden existe
    const orden = await this.prisma.orden.findUnique({
      where: { id: createEnvioDto.ordenId },
      include: { envio: true },
    });
    if (!orden) {
      throw new NotFoundException('La orden especificada no existe');
    }
    if (orden.envio) {
      throw new ConflictException('La orden ya tiene un envío registrado');
    }
    if (orden.estado === EstadoOrden.CANCELADO) {
      throw new BadRequestException(
        'No se puede crear envío para una orden cancelada',
      );
    }

    return this.prisma.envio.create({
      data: {
        ordenId: createEnvioDto.ordenId,
        numeroSeguimiento: createEnvioDto.numeroSeguimiento,
        transportista: createEnvioDto.transportista,
        estado: EstadoEnvio.PENDIENTE,
      },
      include: {
        orden: {
          select: { id: true, numeroOrden: true, clienteId: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.envio.findMany({
      include: {
        orden: {
          select: {
            id: true,
            numeroOrden: true,
            clienteId: true,
            estado: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByOrden(ordenId: string) {
    const envio = await this.prisma.envio.findUnique({
      where: { ordenId },
      include: {
        orden: {
          select: { id: true, numeroOrden: true, clienteId: true },
        },
      },
    });

    if (!envio) {
      throw new NotFoundException(
        `No hay envío registrado para la orden ${ordenId}`,
      );
    }

    return envio;
  }

  async findOne(id: string) {
    const envio = await this.prisma.envio.findUnique({
      where: { id },
      include: {
        orden: {
          select: { id: true, numeroOrden: true, clienteId: true },
        },
      },
    });

    if (!envio) {
      throw new NotFoundException(`Envío con ID ${id} no encontrado`);
    }

    return envio;
  }

  async update(id: string, updateEnvioDto: UpdateEnvioDto) {
    const existing = await this.prisma.envio.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Envío con ID ${id} no encontrado`);
    }

    const updateData: Record<string, unknown> = {};

    if (updateEnvioDto.numeroSeguimiento !== undefined) {
      updateData.numeroSeguimiento = updateEnvioDto.numeroSeguimiento;
    }
    if (updateEnvioDto.transportista !== undefined) {
      updateData.transportista = updateEnvioDto.transportista;
    }
    if (updateEnvioDto.estado !== undefined) {
      updateData.estado = updateEnvioDto.estado;

      // Registrar fechas según estado
      if (updateEnvioDto.estado === EstadoEnvioEnum.EN_CAMINO) {
        updateData.enviadoEn = new Date();
      } else if (updateEnvioDto.estado === EstadoEnvioEnum.ENTREGADO) {
        updateData.entregadoEn = new Date();
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const envio = await tx.envio.update({
        where: { id },
        data: updateData,
      });

      // Actualizar estado de la orden según estado del envío
      if (updateEnvioDto.estado === EstadoEnvioEnum.EN_CAMINO) {
        await tx.orden.update({
          where: { id: existing.ordenId },
          data: { estado: EstadoOrden.ENVIADO },
        });
        this.logger.log(`Envío ${id} marcado como enviado - Orden ${existing.ordenId}`);
      } else if (updateEnvioDto.estado === EstadoEnvioEnum.ENTREGADO) {
        await tx.orden.update({
          where: { id: existing.ordenId },
          data: { estado: EstadoOrden.ENTREGADO },
        });
        this.logger.log(`Envío ${id} marcado como entregado - Orden ${existing.ordenId}`);
      }

      return envio;
    });
  }

  async marcarEnviado(
    id: string,
    numeroSeguimiento?: string,
    transportista?: string,
  ) {
    return this.update(id, {
      estado: EstadoEnvioEnum.EN_CAMINO,
      numeroSeguimiento,
      transportista,
    });
  }

  async marcarEntregado(id: string) {
    return this.update(id, {
      estado: EstadoEnvioEnum.ENTREGADO,
    });
  }
}
