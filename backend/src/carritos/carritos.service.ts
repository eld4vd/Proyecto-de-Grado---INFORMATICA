import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import {
  AddItemCarritoDto,
  UpdateItemCarritoDto,
} from './dto/item-carrito.dto';
import { EstadoCarrito, Prisma } from '@prisma/client';

@Injectable()
export class CarritosService {
  private readonly logger = new Logger(CarritosService.name);
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo carrito para un cliente
   */
  async create(createCarritoDto: CreateCarritoDto) {
    // Verificar que el cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: createCarritoDto.clienteId },
    });
    if (!cliente || cliente.deletedAt) {
      throw new NotFoundException('El cliente especificado no existe');
    }

    return this.prisma.carrito.create({
      data: {
        clienteId: createCarritoDto.clienteId,
        estado: EstadoCarrito.ACTIVO,
      },
      include: {
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
  }

  /**
   * Obtener o crear el carrito activo de un cliente
   */
  async getOrCreateActiveCart(clienteId: string) {
    // Verificar que el cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });
    if (!cliente || cliente.deletedAt) {
      throw new NotFoundException('El cliente especificado no existe');
    }

    // Buscar carrito activo
    let carrito = await this.prisma.carrito.findFirst({
      where: {
        clienteId,
        estado: EstadoCarrito.ACTIVO,
      },
      include: {
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

    // Si no hay carrito activo, crear uno
    if (!carrito) {
      carrito = await this.prisma.carrito.create({
        data: {
          clienteId,
          estado: EstadoCarrito.ACTIVO,
        },
        include: {
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
    }

    return this.formatCarritoResponse(carrito);
  }

  /**
   * Obtener todos los carritos (admin)
   */
  async findAll() {
    return this.prisma.carrito.findMany({
      include: {
        cliente: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener un carrito por ID
   */
  async findOne(id: string) {
    const carrito = await this.prisma.carrito.findUnique({
      where: { id },
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

    if (!carrito) {
      throw new NotFoundException(`Carrito con ID ${id} no encontrado`);
    }

    return this.formatCarritoResponse(carrito);
  }

  /**
   * Agregar un item al carrito
   */
  async addItem(carritoId: string, addItemDto: AddItemCarritoDto) {
    // Verificar que el carrito existe y está activo
    const carrito = await this.prisma.carrito.findUnique({
      where: { id: carritoId },
    });
    if (!carrito) {
      throw new NotFoundException(`Carrito con ID ${carritoId} no encontrado`);
    }
    if (carrito.estado !== EstadoCarrito.ACTIVO) {
      throw new BadRequestException('El carrito no está activo');
    }

    // Verificar que el producto existe y tiene stock
    const producto = await this.prisma.producto.findUnique({
      where: { id: addItemDto.productoId },
    });
    if (!producto || producto.deletedAt || !producto.activo) {
      throw new NotFoundException(
        'El producto especificado no existe o no está disponible',
      );
    }
    if (producto.stock < addItemDto.cantidad) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${producto.stock}`,
      );
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = await this.prisma.itemCarrito.findFirst({
      where: {
        carritoId,
        productoId: addItemDto.productoId,
      },
    });

    if (existingItem) {
      // Actualizar cantidad
      const newCantidad = existingItem.cantidad + addItemDto.cantidad;
      if (producto.stock < newCantidad) {
        throw new BadRequestException(
          `Stock insuficiente. Disponible: ${producto.stock}, solicitado: ${newCantidad}`,
        );
      }

      // Usar precioOferta si existe y es > 0, sino precio base
      const precioEfectivo = producto.precioOferta != null && Number(producto.precioOferta) > 0
        ? producto.precioOferta
        : producto.precio;

      await this.prisma.itemCarrito.update({
        where: { id: existingItem.id },
        data: {
          cantidad: newCantidad,
          precioUnitario: precioEfectivo,
        },
      });
    } else {
      // Usar precioOferta si existe y es > 0, sino precio base
      const precioEfectivo = producto.precioOferta != null && Number(producto.precioOferta) > 0
        ? producto.precioOferta
        : producto.precio;

      // Crear nuevo item
      await this.prisma.itemCarrito.create({
        data: {
          carritoId,
          productoId: addItemDto.productoId,
          cantidad: addItemDto.cantidad,
          precioUnitario: precioEfectivo,
        },
      });
    }

    return this.findOne(carritoId);
  }

  /**
   * Actualizar cantidad de un item
   */
  async updateItem(itemId: string, updateItemDto: UpdateItemCarritoDto) {
    const item = await this.prisma.itemCarrito.findUnique({
      where: { id: itemId },
      include: {
        carrito: true,
        producto: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item con ID ${itemId} no encontrado`);
    }
    if (item.carrito.estado !== EstadoCarrito.ACTIVO) {
      throw new BadRequestException('El carrito no está activo');
    }
    if (item.producto.stock < updateItemDto.cantidad) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${item.producto.stock}`,
      );
    }

    // Usar precioOferta si existe y es > 0, sino precio base
    const precioEfectivo = item.producto.precioOferta != null && Number(item.producto.precioOferta) > 0
      ? item.producto.precioOferta
      : item.producto.precio;

    await this.prisma.itemCarrito.update({
      where: { id: itemId },
      data: {
        cantidad: updateItemDto.cantidad,
        precioUnitario: precioEfectivo,
      },
    });

    return this.findOne(item.carritoId);
  }

  /**
   * Eliminar un item del carrito
   */
  async removeItem(itemId: string) {
    const item = await this.prisma.itemCarrito.findUnique({
      where: { id: itemId },
      include: { carrito: true },
    });

    if (!item) {
      throw new NotFoundException(`Item con ID ${itemId} no encontrado`);
    }
    if (item.carrito.estado !== EstadoCarrito.ACTIVO) {
      throw new BadRequestException('El carrito no está activo');
    }

    await this.prisma.itemCarrito.delete({ where: { id: itemId } });

    return this.findOne(item.carritoId);
  }

  /**
   * Vaciar el carrito
   */
  async clearCart(carritoId: string) {
    const carrito = await this.prisma.carrito.findUnique({
      where: { id: carritoId },
    });
    if (!carrito) {
      throw new NotFoundException(`Carrito con ID ${carritoId} no encontrado`);
    }
    if (carrito.estado !== EstadoCarrito.ACTIVO) {
      throw new BadRequestException('El carrito no está activo');
    }

    await this.prisma.itemCarrito.deleteMany({
      where: { carritoId },
    });

    return this.findOne(carritoId);
  }

  /**
   * Marcar carrito como convertido (después de crear orden)
   */
  async markAsConverted(carritoId: string) {
    return this.prisma.carrito.update({
      where: { id: carritoId },
      data: { estado: EstadoCarrito.CONVERTIDO },
    });
  }

  /**
   * Marcar carrito como abandonado
   */
  async markAsAbandoned(carritoId: string) {
    return this.prisma.carrito.update({
      where: { id: carritoId },
      data: { estado: EstadoCarrito.ABANDONADO },
    });
  }

  /**
   * Formatear respuesta del carrito con totales
   */
  private formatCarritoResponse(carrito: any) {
    const items = carrito.items || [];
    const subtotal = items.reduce((acc: number, item: any) => {
      const precio = item.precioUnitario ?? item.producto.precio;
      return acc + Number(precio) * item.cantidad;
    }, 0);

    const totalItems = items.reduce(
      (acc: number, item: any) => acc + item.cantidad,
      0,
    );

    return {
      ...carrito,
      subtotal: Number(subtotal.toFixed(2)),
      totalItems,
    };
  }
}
