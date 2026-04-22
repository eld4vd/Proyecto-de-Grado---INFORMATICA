import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { generateOrderNumber } from '../common/utils/transforms.util';
import { EstadoOrden, EstadoPago, EstadoCarrito, Prisma } from '@prisma/client';

@Injectable()
export class OrdenesService {
  private readonly logger = new Logger(OrdenesService.name);
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva orden
   */
  async create(createOrdenDto: CreateOrdenDto) {
    // Verificar que el cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: createOrdenDto.clienteId },
    });
    if (!cliente || cliente.deletedAt) {
      throw new NotFoundException('El cliente especificado no existe');
    }

    // Obtener dirección de envío
    let direccionEnvioTexto = createOrdenDto.direccionEnvioTexto;
    if (createOrdenDto.direccionId && !direccionEnvioTexto) {
      const direccion = await this.prisma.direccion.findUnique({
        where: { id: createOrdenDto.direccionId },
      });
      if (direccion) {
        direccionEnvioTexto = `${direccion.calle}, ${direccion.ciudad}, ${direccion.departamento}${direccion.codigoPostal ? `, CP: ${direccion.codigoPostal}` : ''}`;
      }
    }

    // Determinar items de la orden
    let itemsToCreate: Array<{
      productoId: string;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
      nombreProducto: string;
      sku: string;
    }> = [];

    if (createOrdenDto.carritoId) {
      // Crear desde carrito
      const carrito = await this.prisma.carrito.findUnique({
        where: { id: createOrdenDto.carritoId },
        include: {
          items: {
            include: { producto: true },
          },
        },
      });

      if (!carrito || carrito.estado !== EstadoCarrito.ACTIVO) {
        throw new BadRequestException('El carrito no existe o no está activo');
      }
      if (carrito.items.length === 0) {
        throw new BadRequestException('El carrito está vacío');
      }

      // Verificar stock de todos los productos
      for (const item of carrito.items) {
        if (item.producto.stock < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para ${item.producto.nombre}. Disponible: ${item.producto.stock}`,
          );
        }
      }

      itemsToCreate = carrito.items.map((item) => {
        // Usar precioOferta si existe y es > 0, sino precio base
        const precioEfectivo = item.producto.precioOferta != null && Number(item.producto.precioOferta) > 0
          ? Number(item.producto.precioOferta)
          : Number(item.producto.precio);
        return {
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: precioEfectivo,
          subtotal: precioEfectivo * item.cantidad,
          nombreProducto: item.producto.nombre,
          sku: item.producto.sku,
        };
      });
    } else if (createOrdenDto.items?.length) {
      // Crear desde items proporcionados
      for (const item of createOrdenDto.items) {
        const producto = await this.prisma.producto.findUnique({
          where: { id: item.productoId },
        });

        if (!producto || producto.deletedAt || !producto.activo) {
          throw new NotFoundException(
            `Producto con ID ${item.productoId} no encontrado o no disponible`,
          );
        }
        if (producto.stock < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
          );
        }

        // Usar precioOferta si existe y es > 0, sino precio base
        const precioEfectivo = producto.precioOferta != null && Number(producto.precioOferta) > 0
          ? Number(producto.precioOferta)
          : Number(producto.precio);
        itemsToCreate.push({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: precioEfectivo,
          subtotal: precioEfectivo * item.cantidad,
          nombreProducto: producto.nombre,
          sku: producto.sku,
        });
      }
    } else {
      throw new BadRequestException(
        'Debe proporcionar un carritoId o una lista de items',
      );
    }

    // Calcular totales
    const subtotal = itemsToCreate.reduce(
      (acc, item) => acc + item.subtotal,
      0,
    );
    let descuento = 0;
    let codigoPromocionalId: string | null = null;
    const codigoPromocional = createOrdenDto.codigoPromocional
      ?.trim()
      .toUpperCase();

    if (codigoPromocional) {
      const promo = await this.prisma.codigoPromocional.findUnique({
        where: { codigo: codigoPromocional },
      });

      if (!promo) {
        throw new BadRequestException('Código promocional no válido');
      }

      if (!promo.activo) {
        throw new BadRequestException('El código promocional está inactivo');
      }

      if (promo.fechaExpiracion && new Date() > promo.fechaExpiracion) {
        throw new BadRequestException('El código promocional ha expirado');
      }

      if (promo.usosMaximos && promo.usosActuales >= promo.usosMaximos) {
        throw new BadRequestException(
          'El código promocional alcanzó su límite de usos',
        );
      }

      const descuentoBase = promo.esPorcentaje
        ? subtotal * (Number(promo.descuento) / 100)
        : Number(promo.descuento);

      descuento = Math.max(0, Math.min(descuentoBase, subtotal));
      codigoPromocionalId = promo.id;
    }

    const costoEnvio = createOrdenDto.costoEnvio ?? 0;
    const total = Math.max(0, subtotal - descuento) + costoEnvio;

    // Crear la orden en una transacción
    const orden = await this.prisma.$transaction(async (tx) => {
      if (codigoPromocionalId) {
        await tx.codigoPromocional.update({
          where: { id: codigoPromocionalId },
          data: { usosActuales: { increment: 1 } },
        });
      }

      // Crear la orden
      const nuevaOrden = await tx.orden.create({
        data: {
          numeroOrden: generateOrderNumber(),
          clienteId: createOrdenDto.clienteId,
          codigoPromocionalId,
          estado: EstadoOrden.PENDIENTE,
          estadoPago: EstadoPago.PENDIENTE,
          subtotal: new Prisma.Decimal(subtotal),
          descuento: new Prisma.Decimal(descuento),
          costoEnvio: new Prisma.Decimal(costoEnvio),
          total: new Prisma.Decimal(total),
          direccionEnvioTexto,
          notas: createOrdenDto.notas,
          items: {
            create: itemsToCreate.map((item) => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnitario: new Prisma.Decimal(item.precioUnitario),
              subtotal: new Prisma.Decimal(item.subtotal),
              nombreProducto: item.nombreProducto,
              sku: item.sku,
            })),
          },
        },
        include: {
          cliente: {
            select: { id: true, nombre: true, apellido: true, email: true },
          },
          items: {
            include: {
              producto: {
                include: {
                  imagenes: { where: { esPrincipal: true }, take: 1 },
                },
              },
            },
          },
        },
      });

      // Reducir stock de productos
      for (const item of itemsToCreate) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.cantidad } },
        });
      }

      // Si se creó desde carrito, marcarlo como convertido
      if (createOrdenDto.carritoId) {
        await tx.carrito.update({
          where: { id: createOrdenDto.carritoId },
          data: { estado: EstadoCarrito.CONVERTIDO },
        });
      }

      return nuevaOrden;
    });

    this.logger.log(`Orden ${orden.numeroOrden} creada para cliente ${createOrdenDto.clienteId} - Total: ${total}`);
    return orden;
  }

  /**
   * Obtener todas las órdenes
   */
  async findAll(params?: {
    skip?: number;
    take?: number;
    clienteId?: string;
    estado?: EstadoOrden;
    estadoPago?: EstadoPago;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }) {
    const {
      skip = 0,
      take = 20,
      clienteId,
      estado,
      estadoPago,
      fechaDesde,
      fechaHasta,
    } = params || {};

    const where: Prisma.OrdenWhereInput = {
      ...(clienteId && { clienteId }),
      ...(estado && { estado }),
      ...(estadoPago && { estadoPago }),
      ...(fechaDesde || fechaHasta
        ? {
            createdAt: {
              ...(fechaDesde && { gte: fechaDesde }),
              ...(fechaHasta && { lte: fechaHasta }),
            },
          }
        : {}),
    };

    const [ordenes, total] = await Promise.all([
      this.prisma.orden.findMany({
        where,
        skip,
        take,
        include: {
          cliente: {
            select: { id: true, nombre: true, apellido: true, email: true },
          },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.orden.count({ where }),
    ]);

    return {
      data: ordenes,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Obtener una orden por ID
   */
  async findOne(id: string) {
    const orden = await this.prisma.orden.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
        items: {
          include: {
            producto: {
              include: {
                imagenes: { where: { esPrincipal: true }, take: 1 },
              },
            },
          },
        },
        pagos: true,
        envio: true,
      },
    });

    if (!orden) {
      throw new NotFoundException(`Orden con ID ${id} no encontrada`);
    }

    return orden;
  }

  /**
   * Obtener una orden por número de orden
   */
  async findByNumeroOrden(numeroOrden: string) {
    const orden = await this.prisma.orden.findUnique({
      where: { numeroOrden },
      include: {
        cliente: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
        items: {
          include: {
            producto: {
              include: {
                imagenes: { where: { esPrincipal: true }, take: 1 },
              },
            },
          },
        },
        pagos: true,
        envio: true,
      },
    });

    if (!orden) {
      throw new NotFoundException(
        `Orden con número ${numeroOrden} no encontrada`,
      );
    }

    return orden;
  }

  /**
   * Obtener órdenes de un cliente
   */
  async findByCliente(clienteId: string) {
    return this.prisma.orden.findMany({
      where: { clienteId },
      include: {
        _count: { select: { items: true } },
        items: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                imagenes: {
                  select: { url: true, esPrincipal: true },
                  take: 1,
                },
              },
            },
          },
        },
        pagos: {
          select: {
            metodoPago: true,
            estado: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Actualizar una orden
   */
  async update(id: string, updateOrdenDto: UpdateOrdenDto) {
    const existing = await this.prisma.orden.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Orden con ID ${id} no encontrada`);
    }

    return this.prisma.orden.update({
      where: { id },
      data: updateOrdenDto,
      include: {
        cliente: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
        items: true,
        pagos: true,
        envio: true,
      },
    });
  }

  /**
   * Cancelar una orden
   */
  async cancelar(id: string) {
    const orden = await this.prisma.orden.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!orden) {
      throw new NotFoundException(`Orden con ID ${id} no encontrada`);
    }

    if (orden.estado === EstadoOrden.ENTREGADO) {
      throw new BadRequestException('No se puede cancelar una orden entregada');
    }

    if (orden.estado === EstadoOrden.CANCELADO) {
      throw new BadRequestException('La orden ya está cancelada');
    }

    // Restaurar stock
    await this.prisma.$transaction(async (tx) => {
      for (const item of orden.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { increment: item.cantidad } },
        });
      }

      await tx.orden.update({
        where: { id },
        data: { estado: EstadoOrden.CANCELADO },
      });
    });

    return this.findOne(id);
  }
}
