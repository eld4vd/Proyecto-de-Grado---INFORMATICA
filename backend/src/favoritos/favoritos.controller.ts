import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FavoritosService } from './favoritos.service';
import { CreateFavoritoDto } from './dto/favorito.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('favoritos')
@UseGuards(JwtAuthGuard)
export class FavoritosController {
  constructor(private readonly favoritosService: FavoritosService) {}

  /**
   * GET /favoritos - Obtener todos los favoritos del cliente autenticado
   */
  @Get()
  findAll(@Request() req: any) {
    const clienteId = req.user.id;
    return this.favoritosService.findAllByCliente(clienteId);
  }

  /**
   * GET /favoritos/ids - Obtener solo los IDs de productos favoritos
   */
  @Get('ids')
  findProductIds(@Request() req: any) {
    const clienteId = req.user.id;
    return this.favoritosService.findProductIdsByCliente(clienteId);
  }

  /**
   * GET /favoritos/count - Contar favoritos
   */
  @Get('count')
  count(@Request() req: any) {
    const clienteId = req.user.id;
    return this.favoritosService.countByCliente(clienteId);
  }

  /**
   * GET /favoritos/check/:productoId - Verificar si un producto es favorito
   */
  @Get('check/:productoId')
  checkFavorito(
    @Request() req: any,
    @Param('productoId', ParseUUIDPipe) productoId: string,
  ) {
    const clienteId = req.user.id;
    return this.favoritosService.isFavorito(clienteId, productoId);
  }

  /**
   * POST /favoritos - Agregar un producto a favoritos
   */
  @Post()
  addFavorito(
    @Request() req: any,
    @Body() createFavoritoDto: CreateFavoritoDto,
  ) {
    const clienteId = req.user.id;
    return this.favoritosService.addFavorito(clienteId, createFavoritoDto);
  }

  /**
   * POST /favoritos/toggle/:productoId - Toggle favorito
   */
  @Post('toggle/:productoId')
  toggleFavorito(
    @Request() req: any,
    @Param('productoId', ParseUUIDPipe) productoId: string,
  ) {
    const clienteId = req.user.id;
    return this.favoritosService.toggleFavorito(clienteId, productoId);
  }

  /**
   * DELETE /favoritos/:productoId - Eliminar de favoritos
   */
  @Delete(':productoId')
  removeFavorito(
    @Request() req: any,
    @Param('productoId', ParseUUIDPipe) productoId: string,
  ) {
    const clienteId = req.user.id;
    return this.favoritosService.removeFavorito(clienteId, productoId);
  }

  /**
   * DELETE /favoritos - Limpiar todos los favoritos
   */
  @Delete()
  clearAll(@Request() req: any) {
    const clienteId = req.user.id;
    return this.favoritosService.clearAllByCliente(clienteId);
  }
}
