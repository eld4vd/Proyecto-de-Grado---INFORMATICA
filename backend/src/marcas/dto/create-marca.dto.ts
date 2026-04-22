import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import {
  toTrimmedString,
  toTrimmedStringOrNull,
  generateSlug,
} from '../../common/utils/transforms.util';

export class CreateMarcaDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  @Transform(({ value }) => toTrimmedString(value))
  nombre!: string;

  @IsOptional()
  @IsString({ message: 'El slug debe ser un texto' })
  @MaxLength(255, { message: 'El slug no puede exceder 255 caracteres' })
  @Transform(({ value, obj }) => {
    const trimmed = toTrimmedStringOrNull(value);
    return trimmed ?? generateSlug(obj.nombre || '');
  })
  slug?: string;

  @IsOptional()
  @IsString({ message: 'La URL del logo debe ser un texto' })
  @MaxLength(500, {
    message: 'La URL del logo no puede exceder 500 caracteres',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  logoUrl?: string | null;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un booleano' })
  activo?: boolean;
}
