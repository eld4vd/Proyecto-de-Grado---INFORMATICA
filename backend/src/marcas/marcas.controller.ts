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
import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Public, Roles } from '../auth/decorators';
import { Role } from '../auth/enums';

@Controller('marcas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarcasController {
  constructor(private readonly marcasService: MarcasService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createMarcaDto: CreateMarcaDto) {
    return this.marcasService.create(createMarcaDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.marcasService.findAll();
  }

  @Public()
  @Get('activas')
  findAllActive() {
    return this.marcasService.findAllActive();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.marcasService.findOne(id);
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.marcasService.findBySlug(slug);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarcaDto: UpdateMarcaDto,
  ) {
    return this.marcasService.update(id, updateMarcaDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.marcasService.remove(id);
  }
}
