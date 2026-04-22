import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { EstadoOrden, EstadoPago } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards';

@Controller('ordenes')
@UseGuards(JwtAuthGuard)
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Post()
  create(@Body() createOrdenDto: CreateOrdenDto) {
    return this.ordenesService.create(createOrdenDto);
  }

  @Get()
  findAll(
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('clienteId') clienteId?: string,
    @Query('estado') estado?: EstadoOrden,
    @Query('estadoPago') estadoPago?: EstadoPago,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.ordenesService.findAll({
      skip,
      take,
      clienteId,
      estado,
      estadoPago,
      fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
    });
  }

  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId', ParseUUIDPipe) clienteId: string) {
    return this.ordenesService.findByCliente(clienteId);
  }

  @Get('numero/:numeroOrden')
  findByNumeroOrden(@Param('numeroOrden') numeroOrden: string) {
    return this.ordenesService.findByNumeroOrden(numeroOrden);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordenesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrdenDto: UpdateOrdenDto,
  ) {
    return this.ordenesService.update(id, updateOrdenDto);
  }

  @Post(':id/cancelar')
  cancelar(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordenesService.cancelar(id);
  }
}
