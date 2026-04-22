import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResenasService } from './resenas.service';
import { CreateResenaDto } from './dto/create-resena.dto';
import { UpdateResenaDto } from './dto/update-resena.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Public, Roles } from '../auth/decorators';
import { Role } from '../auth/enums';

@Controller('resenas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResenasController {
  constructor(private readonly resenasService: ResenasService) {}

  @Post()
  create(@Body() createResenaDto: CreateResenaDto) {
    return this.resenasService.create(createResenaDto);
  }

  @Public()
  @Get()
  findAll(
    @Query('productoId') productoId?: string,
    @Query('clienteId') clienteId?: string,
    @Query('esAprobado') esAprobado?: string,
    @Query('esVerificado') esVerificado?: string,
  ) {
    return this.resenasService.findAll({
      productoId,
      clienteId,
      esAprobado: esAprobado ? esAprobado === 'true' : undefined,
      esVerificado: esVerificado ? esVerificado === 'true' : undefined,
    });
  }

  @Public()
  @Get('producto/:productoId')
  findByProducto(
    @Param('productoId', ParseUUIDPipe) productoId: string,
    @Query('todas') todas?: string,
  ) {
    return this.resenasService.findByProducto(productoId, todas !== 'true');
  }

  @Public()
  @Get('producto/:productoId/stats')
  getProductoStats(@Param('productoId', ParseUUIDPipe) productoId: string) {
    return this.resenasService.getProductoStats(productoId);
  }

  @Get('puede-resenar/:productoId/:clienteId')
  puedeResenar(
    @Param('productoId', ParseUUIDPipe) productoId: string,
    @Param('clienteId', ParseUUIDPipe) clienteId: string,
  ) {
    return this.resenasService.puedeResenar(productoId, clienteId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.resenasService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateResenaDto: UpdateResenaDto,
  ) {
    return this.resenasService.update(id, updateResenaDto);
  }

  @Post(':id/aprobar')
  @Roles(Role.ADMIN)
  aprobar(@Param('id', ParseUUIDPipe) id: string) {
    return this.resenasService.aprobar(id);
  }

  @Post(':id/rechazar')
  @Roles(Role.ADMIN)
  rechazar(@Param('id', ParseUUIDPipe) id: string) {
    return this.resenasService.rechazar(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.resenasService.remove(id);
  }
}
