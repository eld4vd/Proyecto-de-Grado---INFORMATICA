import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { toTrimmedStringOrNull } from '../../common/utils/transforms.util';

export class UpdateResenaDto {
  @IsOptional()
  @IsInt({ message: 'La calificación debe ser un número entero' })
  @Min(1, { message: 'La calificación mínima es 1' })
  @Max(5, { message: 'La calificación máxima es 5' })
  @Type(() => Number)
  calificacion?: number;

  @IsOptional()
  @IsString({ message: 'El título debe ser un texto' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  titulo?: string | null;

  @IsOptional()
  @IsString({ message: 'El comentario debe ser un texto' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  comentario?: string | null;

  @IsOptional()
  @IsBoolean({ message: 'esAprobado debe ser un booleano' })
  esAprobado?: boolean;
}
