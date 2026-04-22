-- CreateEnum
CREATE TYPE "EstadoCarrito" AS ENUM ('ACTIVO', 'CONVERTIDO', 'ABANDONADO');

-- CreateEnum
CREATE TYPE "EstadoOrden" AS ENUM ('PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO');

-- CreateEnum
CREATE TYPE "EstadoEnvio" AS ENUM ('PENDIENTE', 'EN_CAMINO', 'ENTREGADO');

-- CreateTable
CREATE TABLE "admin_usuarios" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" VARCHAR(255),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "admin_usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "categoria_padre_id" UUID,
    "imagen_url" VARCHAR(500),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marcas" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "logo_url" VARCHAR(500),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" UUID NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "nombre" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(500) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "marca_id" UUID,
    "precio" DECIMAL(12,2) NOT NULL,
    "precio_oferta" DECIMAL(12,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_categorias" (
    "producto_id" UUID NOT NULL,
    "categoria_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productos_categorias_pkey" PRIMARY KEY ("producto_id","categoria_id")
);

-- CreateTable
CREATE TABLE "imagenes_producto" (
    "id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagenes_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "especificaciones_producto" (
    "id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "valor" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "especificaciones_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "apellido" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "telefono" VARCHAR(50),
    "nit_ci" VARCHAR(50),
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direcciones" (
    "id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "calle" VARCHAR(500) NOT NULL,
    "ciudad" VARCHAR(255) NOT NULL,
    "departamento" VARCHAR(255) NOT NULL,
    "codigo_postal" VARCHAR(20),
    "es_predeterminada" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "direcciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carritos" (
    "id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "estado" "EstadoCarrito" NOT NULL DEFAULT 'ACTIVO',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "carritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_carrito" (
    "id" UUID NOT NULL,
    "carrito_id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(12,2),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "items_carrito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes" (
    "id" UUID NOT NULL,
    "numero_orden" VARCHAR(50) NOT NULL,
    "cliente_id" UUID NOT NULL,
    "estado" "EstadoOrden" NOT NULL DEFAULT 'PENDIENTE',
    "estado_pago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "costo_envio" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "direccion_envio_texto" TEXT,
    "notas" TEXT,
    "codigo_promocional_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ordenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_orden" (
    "id" UUID NOT NULL,
    "orden_id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "nombre_producto" VARCHAR(500),
    "sku" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_orden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" UUID NOT NULL,
    "orden_id" UUID NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "metodo_pago" VARCHAR(50) NOT NULL,
    "transaccion_id" VARCHAR(255),
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_pago" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envios" (
    "id" UUID NOT NULL,
    "orden_id" UUID NOT NULL,
    "numero_seguimiento" VARCHAR(255),
    "transportista" VARCHAR(255),
    "estado" "EstadoEnvio" NOT NULL DEFAULT 'PENDIENTE',
    "enviado_en" TIMESTAMPTZ,
    "entregado_en" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "envios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resenas" (
    "id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "orden_id" UUID,
    "calificacion" INTEGER NOT NULL,
    "titulo" VARCHAR(255),
    "comentario" TEXT,
    "es_verificado" BOOLEAN NOT NULL DEFAULT false,
    "es_aprobado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "resenas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoritos" (
    "id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codigos_promocionales" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "descuento" DECIMAL(12,2) NOT NULL,
    "es_porcentaje" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_expiracion" TIMESTAMPTZ,
    "usos_maximos" INTEGER,
    "usos_actuales" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "codigos_promocionales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_usuarios_email_key" ON "admin_usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_slug_key" ON "categorias"("slug");

-- CreateIndex
CREATE INDEX "categorias_categoria_padre_id_idx" ON "categorias"("categoria_padre_id");

-- CreateIndex
CREATE INDEX "categorias_activo_idx" ON "categorias"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "marcas_slug_key" ON "marcas"("slug");

-- CreateIndex
CREATE INDEX "marcas_activo_idx" ON "marcas"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "productos_sku_key" ON "productos"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "productos_slug_key" ON "productos"("slug");

-- CreateIndex
CREATE INDEX "productos_marca_id_idx" ON "productos"("marca_id");

-- CreateIndex
CREATE INDEX "productos_activo_idx" ON "productos"("activo");

-- CreateIndex
CREATE INDEX "productos_destacado_idx" ON "productos"("destacado");

-- CreateIndex
CREATE INDEX "imagenes_producto_producto_id_idx" ON "imagenes_producto"("producto_id");

-- CreateIndex
CREATE INDEX "especificaciones_producto_producto_id_idx" ON "especificaciones_producto"("producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE INDEX "direcciones_cliente_id_idx" ON "direcciones"("cliente_id");

-- CreateIndex
CREATE INDEX "carritos_cliente_id_idx" ON "carritos"("cliente_id");

-- CreateIndex
CREATE INDEX "carritos_estado_idx" ON "carritos"("estado");

-- CreateIndex
CREATE INDEX "items_carrito_carrito_id_idx" ON "items_carrito"("carrito_id");

-- CreateIndex
CREATE INDEX "items_carrito_producto_id_idx" ON "items_carrito"("producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "items_carrito_carrito_id_producto_id_key" ON "items_carrito"("carrito_id", "producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_numero_orden_key" ON "ordenes"("numero_orden");

-- CreateIndex
CREATE INDEX "ordenes_cliente_id_idx" ON "ordenes"("cliente_id");

-- CreateIndex
CREATE INDEX "ordenes_estado_idx" ON "ordenes"("estado");

-- CreateIndex
CREATE INDEX "ordenes_estado_pago_idx" ON "ordenes"("estado_pago");

-- CreateIndex
CREATE INDEX "ordenes_created_at_idx" ON "ordenes"("created_at");

-- CreateIndex
CREATE INDEX "items_orden_orden_id_idx" ON "items_orden"("orden_id");

-- CreateIndex
CREATE INDEX "items_orden_producto_id_idx" ON "items_orden"("producto_id");

-- CreateIndex
CREATE INDEX "pagos_orden_id_idx" ON "pagos"("orden_id");

-- CreateIndex
CREATE UNIQUE INDEX "envios_orden_id_key" ON "envios"("orden_id");

-- CreateIndex
CREATE INDEX "resenas_producto_id_idx" ON "resenas"("producto_id");

-- CreateIndex
CREATE INDEX "resenas_cliente_id_idx" ON "resenas"("cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "resenas_producto_id_cliente_id_key" ON "resenas"("producto_id", "cliente_id");

-- CreateIndex
CREATE INDEX "favoritos_cliente_id_idx" ON "favoritos"("cliente_id");

-- CreateIndex
CREATE INDEX "favoritos_producto_id_idx" ON "favoritos"("producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "favoritos_cliente_id_producto_id_key" ON "favoritos"("cliente_id", "producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "codigos_promocionales_codigo_key" ON "codigos_promocionales"("codigo");

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_categoria_padre_id_fkey" FOREIGN KEY ("categoria_padre_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_categorias" ADD CONSTRAINT "productos_categorias_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_categorias" ADD CONSTRAINT "productos_categorias_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes_producto" ADD CONSTRAINT "imagenes_producto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "especificaciones_producto" ADD CONSTRAINT "especificaciones_producto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones" ADD CONSTRAINT "direcciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carritos" ADD CONSTRAINT "carritos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_carrito" ADD CONSTRAINT "items_carrito_carrito_id_fkey" FOREIGN KEY ("carrito_id") REFERENCES "carritos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_carrito" ADD CONSTRAINT "items_carrito_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_codigo_promocional_id_fkey" FOREIGN KEY ("codigo_promocional_id") REFERENCES "codigos_promocionales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_orden" ADD CONSTRAINT "items_orden_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_orden" ADD CONSTRAINT "items_orden_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resenas" ADD CONSTRAINT "resenas_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resenas" ADD CONSTRAINT "resenas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
