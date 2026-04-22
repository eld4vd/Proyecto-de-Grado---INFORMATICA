import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class AddItemCarritoDto {
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  productoId!: string;

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Type(() => Number)
  cantidad!: number;
}

export class UpdateItemCarritoDto {
  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Type(() => Number)
  cantidad!: number;
}
