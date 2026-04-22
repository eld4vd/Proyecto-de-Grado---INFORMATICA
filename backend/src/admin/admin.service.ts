import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    // Obtener estadísticas reales de la BD
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total productos activos
    const productosActivos = await this.prisma.producto.count({
      where: { activo: true },
    });

    // Total clientes
    const totalClientes = await this.prisma.cliente.count();

    // Clientes nuevos este mes
    const clientesNuevosMes = await this.prisma.cliente.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Clientes mes anterior
    const clientesMesAnterior = await this.prisma.cliente.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Órdenes totales
    const totalOrdenes = await this.prisma.orden.count();

    // Órdenes pendientes (estado 'PENDIENTE' o 'PAGADO')
    const ordenesPendientes = await this.prisma.orden.count({
      where: {
        estado: {
          in: ['PENDIENTE', 'PAGADO'],
        },
      },
    });

    // Ventas del mes (suma de órdenes entregadas)
    const ventasMesData = await this.prisma.orden.aggregate({
      where: {
        estado: 'ENTREGADO',
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        total: true,
      },
    });

    const ventasMes = Number(ventasMesData._sum?.total || 0);

    // Ventas mes anterior
    const ventasMesAnteriorData = await this.prisma.orden.aggregate({
      where: {
        estado: 'ENTREGADO',
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
      _sum: {
        total: true,
      },
    });

    const ventasMesAnterior = Number(ventasMesAnteriorData._sum?.total || 0);

    // Calcular porcentajes de cambio
    const cambioVentas =
      ventasMesAnterior > 0
        ? ((ventasMes - ventasMesAnterior) / ventasMesAnterior) * 100
        : 0;

    const cambioClientes =
      clientesMesAnterior > 0
        ? ((clientesNuevosMes - clientesMesAnterior) / clientesMesAnterior) *
          100
        : 0;

    return {
      ventasMes: {
        valor: ventasMes.toFixed(2),
        cambio: cambioVentas.toFixed(1),
        positivo: cambioVentas >= 0,
      },
      ordenesPendientes: {
        valor: ordenesPendientes,
        total: totalOrdenes,
      },
      productosActivos: {
        valor: productosActivos,
      },
      clientesNuevos: {
        valor: clientesNuevosMes,
        total: totalClientes,
        cambio: cambioClientes.toFixed(1),
        positivo: cambioClientes >= 0,
      },
    };
  }

  async getRecentOrders() {
    const orders = await this.prisma.orden.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      numero: `#${order.id.slice(0, 8).toUpperCase()}`,
      cliente: `${order.cliente.nombre} ${order.cliente.apellido}`,
      total: Number(order.total).toFixed(2),
      estado: order.estado,
      fecha: order.createdAt,
    }));
  }

  async getTopProducts() {
    // Productos más vendidos (basado en cantidad en ItemOrden)
    const topProducts = await this.prisma.itemOrden.groupBy({
      by: ['productoId'],
      _sum: {
        cantidad: true,
      },
      orderBy: {
        _sum: {
          cantidad: 'desc',
        },
      },
      take: 5,
    });

    // Obtener detalles de productos
    const productsData = await Promise.all(
      topProducts.map(async (item) => {
        const producto = await this.prisma.producto.findUnique({
          where: { id: item.productoId },
          include: {
            marca: true,
          },
        });
        return {
          id: producto?.id,
          nombre: producto?.nombre,
          marca: producto?.marca?.nombre,
          precio: Number(producto?.precio || 0).toFixed(2),
          ventas: item._sum.cantidad || 0,
        };
      }),
    );

    return productsData.filter((p) => p.id); // Filtrar nulls
  }

  /**
   * Obtener notificaciones derivadas de datos existentes.
   * No requiere modelo propio — agrega órdenes, pagos, stock y clientes.
   */
  async getNotifications(since?: string) {
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const LOW_STOCK_THRESHOLD = 5;

    const [newOrders, newPayments, lowStockProducts, newClients] =
      await Promise.all([
        // Nuevas órdenes
        this.prisma.orden.findMany({
          where: { createdAt: { gte: sinceDate } },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            cliente: { select: { nombre: true, apellido: true } },
            _count: { select: { items: true } },
          },
        }),

        // Pagos aprobados recientes
        this.prisma.pago.findMany({
          where: {
            createdAt: { gte: sinceDate },
            estado: 'APROBADO',
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            orden: {
              select: { numeroOrden: true },
            },
          },
        }),

        // Productos con stock bajo
        this.prisma.producto.findMany({
          where: {
            activo: true,
            stock: { lte: LOW_STOCK_THRESHOLD },
            deletedAt: null,
          },
          orderBy: { stock: 'asc' },
          take: 10,
          select: {
            id: true,
            nombre: true,
            sku: true,
            stock: true,
          },
        }),

        // Nuevos clientes
        this.prisma.cliente.findMany({
          where: { createdAt: { gte: sinceDate } },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            createdAt: true,
          },
        }),
      ]);

    // Ensamblar notificaciones unificadas con tipo e ISO timestamp
    type Notification = {
      id: string;
      type: 'new_order' | 'payment_received' | 'low_stock' | 'new_client';
      title: string;
      message: string;
      timestamp: string;
      href?: string;
      meta?: Record<string, unknown>;
    };

    const notifications: Notification[] = [];

    for (const order of newOrders) {
      notifications.push({
        id: `order-${order.id}`,
        type: 'new_order',
        title: 'Nueva orden',
        message: `#${order.numeroOrden} — ${order.cliente.nombre} ${order.cliente.apellido} (${order._count.items} productos) — Bs ${Number(order.total).toFixed(2)}`,
        timestamp: order.createdAt.toISOString(),
        href: `/admin/ordenes/${order.id}`,
        meta: { total: Number(order.total), estado: order.estado },
      });
    }

    for (const pago of newPayments) {
      notifications.push({
        id: `payment-${pago.id}`,
        type: 'payment_received',
        title: 'Pago recibido',
        message: `Orden #${pago.orden.numeroOrden} — Bs ${Number(pago.monto).toFixed(2)} (${pago.metodoPago})`,
        timestamp: pago.createdAt.toISOString(),
        href: `/admin/ordenes/${pago.ordenId}`,
        meta: { monto: Number(pago.monto) },
      });
    }

    for (const prod of lowStockProducts) {
      notifications.push({
        id: `stock-${prod.id}`,
        type: 'low_stock',
        title: 'Stock bajo',
        message: `${prod.nombre} (${prod.sku}) — Quedan ${prod.stock} unidades`,
        timestamp: new Date().toISOString(),
        href: `/admin/productos`,
        meta: { stock: prod.stock },
      });
    }

    for (const client of newClients) {
      notifications.push({
        id: `client-${client.id}`,
        type: 'new_client',
        title: 'Nuevo cliente',
        message: `${client.nombre} ${client.apellido} (${client.email})`,
        timestamp: client.createdAt.toISOString(),
        href: `/admin/clientes`,
      });
    }

    // Ordenar por timestamp descendente
    notifications.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return {
      notifications,
      summary: {
        total: notifications.length,
        newOrders: newOrders.length,
        newPayments: newPayments.length,
        lowStock: lowStockProducts.length,
        newClients: newClients.length,
      },
    };
  }
}
