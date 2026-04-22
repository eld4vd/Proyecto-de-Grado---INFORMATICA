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
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Public, Roles } from '../auth/decorators';
import { Role } from '../auth/enums';

@Controller('categorias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriasService.create(createCategoriaDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  @Public()
  @Get('activas')
  findAllActive() {
    return this.categoriasService.findAllActive();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriasService.findOne(id);
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoriasService.findBySlug(slug);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriasService.remove(id);
  }
}
