import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { Role } from '../auth/enums';

@Controller('pagos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  create(@Body() createPagoDto: CreatePagoDto) {
    return this.pagosService.create(createPagoDto);
  }

  @Get()
  findAll() {
    return this.pagosService.findAll();
  }

  @Get('orden/:ordenId')
  findByOrden(@Param('ordenId', ParseUUIDPipe) ordenId: string) {
    return this.pagosService.findByOrden(ordenId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePagoDto: UpdatePagoDto,
  ) {
    return this.pagosService.update(id, updatePagoDto);
  }

  @Post(':id/aprobar')
  aprobar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { transaccionId?: string },
  ) {
    return this.pagosService.aprobar(id, body.transaccionId);
  }

  @Post(':id/rechazar')
  rechazar(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagosService.rechazar(id);
  }
}
