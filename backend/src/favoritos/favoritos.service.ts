import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoritoDto } from './dto/favorito.dto';

@Injectable()
export class FavoritosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtener todos los favoritos de un cliente
   */
  async findAllByCliente(clienteId: string) {
    // Verificar que el cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });
    if (!cliente || cliente.deletedAt) {
      throw new NotFoundException('El cliente especificado no existe');
    }

    const favoritos = await this.prisma.favorito.findMany({
      where: { clienteId },
      include: {
        producto: {
          include: {
            imagenes: { orderBy: { orden: 'asc' } },
            marca: { select: { nombre: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filtrar productos activos y no eliminados
    return favoritos
      .filter((f) => f.producto.activo && !f.producto.deletedAt)
      .map((f) => ({
        id: f.id,
        productoId: f.productoId,
        createdAt: f.createdAt,
        producto: {
          id: f.producto.id,
          nombre: f.producto.nombre,
          slug: f.producto.slug,
          precio: Number(f.producto.precio),
          stock: f.producto.stock,
          activo: f.producto.activo,
          imagenes: f.producto.imagenes,
          marca: f.producto.marca,
        },
      }));
  }

  /**
   * Obtener solo los IDs de productos favoritos de un cliente
   */
  async findProductIdsByCliente(clienteId: string): Promise<string[]> {
    const favoritos = await this.prisma.favorito.findMany({
      where: { clienteId },
      select: { productoId: true },
    });
    return favoritos.map((f) => f.productoId);
  }

  /**
   * Verificar si un producto es favorito
   */
  async isFavorito(clienteId: string, productoId: string): Promise<boolean> {
    const favorito = await this.prisma.favorito.findUnique({
      where: {
        clienteId_productoId: { clienteId, productoId },
      },
    });
    return !!favorito;
  }

  /**
   * Agregar un producto a favoritos
   */
  async addFavorito(clienteId: string, createFavoritoDto: CreateFavoritoDto) {
    const { productoId } = createFavoritoDto;

    // Verificar que el cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });
    if (!cliente || cliente.deletedAt) {
      throw new NotFoundException('El cliente especificado no existe');
    }

    // Verificar que el producto existe y está activo
    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId },
    });
    if (!producto || producto.deletedAt || !producto.activo) {
      throw new NotFoundException(
        'El producto especificado no existe o no está disponible',
      );
    }

    // Verificar si ya es favorito
    const existing = await this.prisma.favorito.findUnique({
      where: {
        clienteId_productoId: { clienteId, productoId },
      },
    });
    if (existing) {
      throw new ConflictException('Este producto ya está en tus favoritos');
    }

    // Crear favorito
    const favorito = await this.prisma.favorito.create({
      data: {
        clienteId,
        productoId,
      },
      include: {
        producto: {
          include: {
            imagenes: { where: { esPrincipal: true }, take: 1 },
            marca: { select: { nombre: true } },
          },
        },
      },
    });

    return {
      id: favorito.id,
      productoId: favorito.productoId,
      createdAt: favorito.createdAt,
      producto: {
        id: favorito.producto.id,
        nombre: favorito.producto.nombre,
        slug: favorito.producto.slug,
        precio: Number(favorito.producto.precio),
        stock: favorito.producto.stock,
        imagenes: favorito.producto.imagenes,
        marca: favorito.producto.marca,
      },
    };
  }

  /**
   * Eliminar un producto de favoritos
   */
  async removeFavorito(clienteId: string, productoId: string) {
    // Verificar que existe el favorito
    const favorito = await this.prisma.favorito.findUnique({
      where: {
        clienteId_productoId: { clienteId, productoId },
      },
    });

    if (!favorito) {
      throw new NotFoundException('Este producto no está en tus favoritos');
    }

    await this.prisma.favorito.delete({
      where: {
        clienteId_productoId: { clienteId, productoId },
      },
    });

    return { message: 'Producto eliminado de favoritos', productoId };
  }

  /**
   * Toggle favorito (agregar si no existe, eliminar si existe)
   */
  async toggleFavorito(clienteId: string, productoId: string) {
    const isFav = await this.isFavorito(clienteId, productoId);

    if (isFav) {
      await this.removeFavorito(clienteId, productoId);
      return {
        isFavorito: false,
        productoId,
        message: 'Eliminado de favoritos',
      };
    } else {
      await this.addFavorito(clienteId, { productoId });
      return { isFavorito: true, productoId, message: 'Agregado a favoritos' };
    }
  }

  /**
   * Contar favoritos de un cliente
   */
  async countByCliente(clienteId: string): Promise<number> {
    return this.prisma.favorito.count({
      where: { clienteId },
    });
  }

  /**
   * Limpiar todos los favoritos de un cliente
   */
  async clearAllByCliente(clienteId: string) {
    const deleted = await this.prisma.favorito.deleteMany({
      where: { clienteId },
    });
    return { message: 'Favoritos eliminados', count: deleted.count };
  }
}
