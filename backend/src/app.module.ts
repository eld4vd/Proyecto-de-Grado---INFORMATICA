import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

// Módulos core
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

// Módulos de catálogo
import { CategoriasModule } from './categorias/categorias.module';
import { MarcasModule } from './marcas/marcas.module';
import { ProductosModule } from './productos/productos.module';

// Módulos de clientes
import { ClientesModule } from './clientes/clientes.module';
import { DireccionesModule } from './direcciones/direcciones.module';

// Módulos de carrito y órdenes
import { CarritosModule } from './carritos/carritos.module';
import { OrdenesModule } from './ordenes/ordenes.module';
import { PagosModule } from './pagos/pagos.module';
import { EnviosModule } from './envios/envios.module';

// Módulos adicionales
import { ResenasModule } from './resenas/resenas.module';
import { AdminModule } from './admin/admin.module';
import { FavoritosModule } from './favoritos/favoritos.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { CodigosPromocionalesModule } from './codigos-promocionales/codigos-promocionales.module';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Core
    PrismaModule,
    AuthModule,

    // Catálogo
    CategoriasModule,
    MarcasModule,
    ProductosModule,

    // Clientes
    ClientesModule,
    DireccionesModule,

    // Carrito y Órdenes
    CarritosModule,
    OrdenesModule,
    PagosModule,
    EnviosModule,

    // Adicionales
    ResenasModule,
    AdminModule,
    FavoritosModule,
    ChatbotModule,
    CodigosPromocionalesModule,
  ],
  controllers: [AppController],
  providers: [
    // Exception filter global - respuestas de error consistentes
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Logging interceptor global - registra tiempo de cada request HTTP
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    AppService,
  ],
})
export class AppModule {}
