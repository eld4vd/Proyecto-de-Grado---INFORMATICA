import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AdjustStockDto {
  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Type(() => Number)
  cantidad!: number; // Puede ser positivo (agregar) o negativo (reducir)
}
