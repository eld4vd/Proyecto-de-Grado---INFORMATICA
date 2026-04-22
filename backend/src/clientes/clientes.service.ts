import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto) {
    // Verificar que el email no exista
    const existingEmail = await this.prisma.cliente.findUnique({
      where: { email: createClienteDto.email },
    });
    if (existingEmail) {
      throw new ConflictException(
        `Ya existe un cliente con el email: ${createClienteDto.email}`,
      );
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(
      createClienteDto.password,
      SALT_ROUNDS,
    );

    const cliente = await this.prisma.cliente.create({
      data: {
        nombre: createClienteDto.nombre,
        apellido: createClienteDto.apellido,
        email: createClienteDto.email,
        passwordHash,
        telefono: createClienteDto.telefono,
        nitCi: createClienteDto.nitCi,
      },
    });

    // No devolver passwordHash
    const { passwordHash: _, ...result } = cliente;
    return result;
  }

  async findAll(params?: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 20, search } = params || {};

    const where: Prisma.ClienteWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { apellido: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [clientes, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          telefono: true,
          nitCi: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              ordenes: true,
              direcciones: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return {
      data: clientes,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        nitCi: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        direcciones: {
          where: { deletedAt: null },
          orderBy: { esPredeterminada: 'desc' },
        },
        ordenes: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            _count: { select: { items: true } },
          },
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return cliente;
  }

  async findByEmail(email: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { email },
    });

    if (!cliente || cliente.deletedAt) {
      throw new NotFoundException(`Cliente con email ${email} no encontrado`);
    }

    return cliente;
  }

  async update(id: string, updateClienteDto: UpdateClienteDto) {
    const existing = await this.prisma.cliente.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = {};

    if (updateClienteDto.nombre !== undefined) {
      updateData.nombre = updateClienteDto.nombre;
    }
    if (updateClienteDto.apellido !== undefined) {
      updateData.apellido = updateClienteDto.apellido;
    }
    if (updateClienteDto.telefono !== undefined) {
      updateData.telefono = updateClienteDto.telefono;
    }
    if (updateClienteDto.nitCi !== undefined) {
      updateData.nitCi = updateClienteDto.nitCi;
    }
    if (updateClienteDto.newPassword) {
      updateData.passwordHash = await bcrypt.hash(
        updateClienteDto.newPassword,
        SALT_ROUNDS,
      );
    }

    const cliente = await this.prisma.cliente.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        nitCi: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return cliente;
  }

  async remove(id: string) {
    const existing = await this.prisma.cliente.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    // Soft delete
    return this.prisma.cliente.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
      },
    });
  }

  async updateLastLogin(id: string) {
    return this.prisma.cliente.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}
