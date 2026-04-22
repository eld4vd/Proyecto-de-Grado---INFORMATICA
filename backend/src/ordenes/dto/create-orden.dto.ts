import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  Matches,
} from 'class-validator';
import { toTrimmedStringOrNull } from '../../common/utils/transforms.util';

export class CreateItemOrdenDto {
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  productoId!: string;

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Type(() => Number)
  cantidad!: number;
}

export class CreateOrdenDto {
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  @IsUUID('4', { message: 'El ID del cliente debe ser un UUID válido' })
  clienteId!: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de la dirección debe ser un UUID válido' })
  direccionId?: string;

  @IsOptional()
  @IsString({ message: 'La dirección de envío debe ser un texto' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  direccionEnvioTexto?: string | null;

  @IsOptional()
  @IsNumber({}, { message: 'El costo de envío debe ser un número' })
  @Min(0, { message: 'El costo de envío debe ser mayor o igual a 0' })
  @Type(() => Number)
  costoEnvio?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El descuento debe ser un número' })
  @Min(0, { message: 'El descuento debe ser mayor o igual a 0' })
  @Type(() => Number)
  descuento?: number;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  notas?: string | null;

  @IsOptional()
  @IsArray({ message: 'Los items deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CreateItemOrdenDto)
  items?: CreateItemOrdenDto[];

  @IsOptional()
  @IsUUID('4', { message: 'El ID del carrito debe ser un UUID válido' })
  carritoId?: string; // Si se proporciona, crea orden desde carrito

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Matches(/^(?=.*[0-9])[A-Z0-9_-]+$/, {
    message:
      'El código promocional debe estar en mayúsculas y contener al menos un número',
  })
  codigoPromocional?: string;
}
