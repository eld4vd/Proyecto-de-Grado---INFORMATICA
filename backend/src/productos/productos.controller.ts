import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  ParseIntPipe,
  ParseFloatPipe,
  DefaultValuePipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import {
  CreateProductoDto,
  CreateImagenProductoDto,
  CreateEspecificacionProductoDto,
} from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Public, Roles } from '../auth/decorators';
import { Role } from '../auth/enums';

@Controller('productos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.create(createProductoDto);
  }

  @Public()
  @Get()
  findAll(
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('search') search?: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('marcaId') marcaId?: string,
    @Query('destacado') destacado?: string,
    @Query('activo') activo?: string,
    @Query('enOferta') enOferta?: string,
    @Query('precioMin', new ParseFloatPipe({ optional: true })) precioMin?: number,
    @Query('precioMax', new ParseFloatPipe({ optional: true })) precioMax?: number,
    @Query('orderBy') orderBy?: string,
    @Query('orderDir') orderDir?: 'asc' | 'desc',
  ) {
    return this.productosService.findAll({
      skip,
      take,
      search,
      categoriaId,
      marcaId,
      destacado: destacado ? destacado === 'true' : undefined,
      activo: activo ? activo === 'true' : undefined,
      enOferta: enOferta ? enOferta === 'true' : undefined,
      precioMin,
      precioMax,
      orderBy,
      orderDir,
    });
  }

  @Public()
  @Get('quick-search')
  quickSearch(@Query('q') query: string) {
    return this.productosService.quickSearch(query);
  }

  @Public()
  @Get('destacados')
  findDestacados(@Query('take', new DefaultValuePipe(8), ParseIntPipe) take: number) {
    return this.productosService.findDestacados(take);
  }

  @Public()
  // Endpoint unificado: acepta tanto UUID como slug
  // Detecta automáticamente el tipo de identificador
  @Get(':identifier')
  findByIdentifier(@Param('identifier') identifier: string) {
    return this.productosService.findByIdOrSlug(identifier);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.productosService.update(id, updateProductoDto);
  }

  @Post(':id/adjust-stock')
  @Roles(Role.ADMIN)
  adjustStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() adjustStockDto: AdjustStockDto,
  ) {
    return this.productosService.adjustStock(id, adjustStockDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productosService.remove(id);
  }

  // === Endpoints para imágenes ===
  @Post(':id/imagenes')
  @Roles(Role.ADMIN)
  addImagen(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: CreateImagenProductoDto,
  ) {
    return this.productosService.addImagen(id, data);
  }

  @Delete('imagenes/:imagenId')
  @Roles(Role.ADMIN)
  removeImagen(@Param('imagenId', ParseUUIDPipe) imagenId: string) {
    return this.productosService.removeImagen(imagenId);
  }

  // === Endpoints para especificaciones ===
  @Roles(Role.ADMIN)
  @Post(':id/especificaciones')
  addEspecificacion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: CreateEspecificacionProductoDto,
  ) {
    return this.productosService.addEspecificacion(id, data);
  }

  @Roles(Role.ADMIN)
  @Delete('especificaciones/:especificacionId')
  removeEspecificacion(
    @Param('especificacionId', ParseUUIDPipe) especificacionId: string,
  ) {
    return this.productosService.removeEspecificacion(especificacionId);
  }
}
