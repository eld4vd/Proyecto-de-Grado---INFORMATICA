import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  toTrimmedString,
  toTrimmedStringOrNull,
  generateSlug,
} from '../../common/utils/transforms.util';

export class CreateCategoriaDto {
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
    // Si no se proporciona slug, generarlo del nombre
    return trimmed ?? generateSlug(obj.nombre || '');
  })
  slug?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  descripcion?: string | null;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de categoría padre debe ser un UUID válido' })
  categoriaPadreId?: string | null;

  @IsOptional()
  @IsString({ message: 'La URL de imagen debe ser un texto' })
  @MaxLength(500, {
    message: 'La URL de imagen no puede exceder 500 caracteres',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  imagenUrl?: string | null;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un booleano' })
  activo?: boolean;
}
