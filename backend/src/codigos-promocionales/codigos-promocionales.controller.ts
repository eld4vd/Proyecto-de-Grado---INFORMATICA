import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CodigosPromocionalesService } from './codigos-promocionales.service';
import { CreateCodigoPromocionalDto } from './dto/create-codigo-promocional.dto';
import { ValidarCodigoDto } from './dto/validar-codigo.dto';
import { UpdateCodigoPromocionalDto } from './dto/update-codigo-promocional.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums';

@Controller('codigos-promocionales')
export class CodigosPromocionalesController {
  constructor(private readonly codigosPromocionalesService: CodigosPromocionalesService) {}

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createDto: CreateCodigoPromocionalDto) {
    return this.codigosPromocionalesService.create(createDto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.codigosPromocionalesService.findAll();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.codigosPromocionalesService.findOne(id);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCodigoPromocionalDto,
  ) {
    return this.codigosPromocionalesService.update(id, updateDto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.codigosPromocionalesService.remove(id);
  }

  @Post('validar')
  @UseGuards(JwtAuthGuard)
  validar(@Body() validarDto: ValidarCodigoDto) {
    return this.codigosPromocionalesService.validarCodigo(
      validarDto.codigo,
      validarDto.subtotal,
    );
  }
}
