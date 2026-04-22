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
import { EnviosService } from './envios.service';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { UpdateEnvioDto } from './dto/update-envio.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { Role } from '../auth/enums';

@Controller('envios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class EnviosController {
  constructor(private readonly enviosService: EnviosService) {}

  @Post()
  create(@Body() createEnvioDto: CreateEnvioDto) {
    return this.enviosService.create(createEnvioDto);
  }

  @Get()
  findAll() {
    return this.enviosService.findAll();
  }

  @Get('orden/:ordenId')
  findByOrden(@Param('ordenId', ParseUUIDPipe) ordenId: string) {
    return this.enviosService.findByOrden(ordenId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.enviosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEnvioDto: UpdateEnvioDto,
  ) {
    return this.enviosService.update(id, updateEnvioDto);
  }

  @Post(':id/enviar')
  marcarEnviado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { numeroSeguimiento?: string; transportista?: string },
  ) {
    return this.enviosService.marcarEnviado(
      id,
      body.numeroSeguimiento,
      body.transportista,
    );
  }

  @Post(':id/entregar')
  marcarEntregado(@Param('id', ParseUUIDPipe) id: string) {
    return this.enviosService.marcarEntregado(id);
  }
}
