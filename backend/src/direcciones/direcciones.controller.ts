import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { DireccionesService } from './direcciones.service';
import { CreateDireccionDto } from './dto/create-direccion.dto';
import { UpdateDireccionDto } from './dto/update-direccion.dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('direcciones')
@UseGuards(JwtAuthGuard)
export class DireccionesController {
  constructor(private readonly direccionesService: DireccionesService) {}

  @Post()
  create(@Body() createDireccionDto: CreateDireccionDto) {
    return this.direccionesService.create(createDireccionDto);
  }

  @Get()
  findAll() {
    return this.direccionesService.findAll();
  }

  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId', ParseUUIDPipe) clienteId: string) {
    return this.direccionesService.findByCliente(clienteId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.direccionesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDireccionDto: UpdateDireccionDto,
  ) {
    return this.direccionesService.update(id, updateDireccionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.direccionesService.remove(id);
  }
}
