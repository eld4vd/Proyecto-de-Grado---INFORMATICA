import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  MaxLength,
  IsNumber,
  Min,
  IsInt,
  IsArray,
  ValidateNested,
} from 'class-validator';
import {
  toTrimmedString,
  toTrimmedStringOrNull,
  generateSlug,
} from '../../common/utils/transforms.util';

export class CreateImagenProductoDto {
  @IsOptional()
  @IsUUID('4', { message: 'El ID de imagen debe ser un UUID válido' })
  id?: string;

  @IsNotEmpty({ message: 'La URL de la imagen es requerida' })
  @IsString({ message: 'La URL debe ser un texto' })
  @MaxLength(500, { message: 'La URL no puede exceder 500 caracteres' })
  @Transform(({ value }) => toTrimmedString(value))
  url!: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo esPrincipal debe ser un booleano' })
  esPrincipal?: boolean;

  @IsOptional()
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden debe ser mayor o igual a 0' })
  orden?: number;
}

export class CreateEspecificacionProductoDto {
  @IsOptional()
  @IsUUID('4', { message: 'El ID de especificación debe ser un UUID válido' })
  id?: string;

  @IsNotEmpty({ message: 'El nombre de la especificación es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  @Transform(({ value }) => toTrimmedString(value))
  nombre!: string;

  @IsNotEmpty({ message: 'El valor de la especificación es requerido' })
  @IsString({ message: 'El valor debe ser un texto' })
  @Transform(({ value }) => toTrimmedString(value))
  valor!: string;
}

export class CreateProductoDto {
  @IsNotEmpty({ message: 'El SKU es requerido' })
  @IsString({ message: 'El SKU debe ser un texto' })
  @MaxLength(100, { message: 'El SKU no puede exceder 100 caracteres' })
  @Transform(({ value }) => toTrimmedString(value))
  sku!: string;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(500, { message: 'El nombre no puede exceder 500 caracteres' })
  @Transform(({ value }) => toTrimmedString(value))
  nombre!: string;

  @IsOptional()
  @IsString({ message: 'El slug debe ser un texto' })
  @MaxLength(500, { message: 'El slug no puede exceder 500 caracteres' })
  @Transform(({ value, obj }) => {
    const trimmed = toTrimmedStringOrNull(value);
    return trimmed ?? generateSlug(obj.nombre || '');
  })
  slug?: string;

  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @Transform(({ value }) => toTrimmedString(value))
  descripcion!: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de marca debe ser un UUID válido' })
  marcaId?: string | null;

  @IsNotEmpty({ message: 'El precio es requerido' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  @Type(() => Number)
  precio!: number;

  @IsOptional()
  @IsNumber({}, { message: 'El precio de oferta debe ser un número' })
  @Min(0, { message: 'El precio de oferta debe ser mayor o igual a 0' })
  @Type(() => Number)
  precioOferta?: number | null;

  @IsOptional()
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un booleano' })
  activo?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El campo destacado debe ser un booleano' })
  destacado?: boolean;

  @IsOptional()
  @IsArray({ message: 'Las categorías deben ser un array' })
  @IsUUID('4', {
    each: true,
    message: 'Cada categoría debe ser un UUID válido',
  })
  categoriasIds?: string[];

  // Alias para compatibilidad con frontend
  @IsOptional()
  @IsArray({ message: 'Las categorías deben ser un array' })
  @IsUUID('4', {
    each: true,
    message: 'Cada categoría debe ser un UUID válido',
  })
  categoriaIds?: string[];

  @IsOptional()
  @IsArray({ message: 'Las imágenes deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CreateImagenProductoDto)
  imagenes?: CreateImagenProductoDto[];

  @IsOptional()
  @IsArray({ message: 'Las especificaciones deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CreateEspecificacionProductoDto)
  especificaciones?: CreateEspecificacionProductoDto[];
}
