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
import { CarritosService } from './carritos.service';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import {
  AddItemCarritoDto,
  UpdateItemCarritoDto,
} from './dto/item-carrito.dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('carritos')
@UseGuards(JwtAuthGuard)
export class CarritosController {
  constructor(private readonly carritosService: CarritosService) {}

  @Post()
  create(@Body() createCarritoDto: CreateCarritoDto) {
    return this.carritosService.create(createCarritoDto);
  }

  @Get()
  findAll() {
    return this.carritosService.findAll();
  }

  @Get('cliente/:clienteId')
  getOrCreateActiveCart(@Param('clienteId', ParseUUIDPipe) clienteId: string) {
    return this.carritosService.getOrCreateActiveCart(clienteId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.carritosService.findOne(id);
  }

  @Post(':id/items')
  addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addItemDto: AddItemCarritoDto,
  ) {
    return this.carritosService.addItem(id, addItemDto);
  }

  @Patch('items/:itemId')
  updateItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateItemDto: UpdateItemCarritoDto,
  ) {
    return this.carritosService.updateItem(itemId, updateItemDto);
  }

  @Delete('items/:itemId')
  removeItem(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.carritosService.removeItem(itemId);
  }

  @Delete(':id/clear')
  clearCart(@Param('id', ParseUUIDPipe) id: string) {
    return this.carritosService.clearCart(id);
  }
}
