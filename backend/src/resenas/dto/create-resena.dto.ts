import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { toTrimmedStringOrNull } from '../../common/utils/transforms.util';

export class CreateResenaDto {
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  productoId!: string;

  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  @IsUUID('4', { message: 'El ID del cliente debe ser un UUID válido' })
  clienteId!: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de la orden debe ser un UUID válido' })
  ordenId?: string | null;

  @IsNotEmpty({ message: 'La calificación es requerida' })
  @IsInt({ message: 'La calificación debe ser un número entero' })
  @Min(1, { message: 'La calificación mínima es 1' })
  @Max(5, { message: 'La calificación máxima es 5' })
  @Type(() => Number)
  calificacion!: number;

  @IsOptional()
  @IsString({ message: 'El título debe ser un texto' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  titulo?: string | null;

  @IsOptional()
  @IsString({ message: 'El comentario debe ser un texto' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  comentario?: string | null;
}
