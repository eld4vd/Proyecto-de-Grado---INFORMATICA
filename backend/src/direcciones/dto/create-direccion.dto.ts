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
} from '../../common/utils/transforms.util';

export class CreateDireccionDto {
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  @IsUUID('4', { message: 'El ID del cliente debe ser un UUID válido' })
  clienteId!: string;

  @IsNotEmpty({ message: 'La calle es requerida' })
  @IsString({ message: 'La calle debe ser un texto' })
  @MaxLength(500, { message: 'La calle no puede exceder 500 caracteres' })
  @Transform(({ value }) => toTrimmedString(value))
  calle!: string;

  @IsNotEmpty({ message: 'La ciudad es requerida' })
  @IsString({ message: 'La ciudad debe ser un texto' })
  @MaxLength(255, { message: 'La ciudad no puede exceder 255 caracteres' })
  @Transform(({ value }) => toTrimmedString(value))
  ciudad!: string;

  @IsNotEmpty({ message: 'El departamento es requerido' })
  @IsString({ message: 'El departamento debe ser un texto' })
  @MaxLength(255, {
    message: 'El departamento no puede exceder 255 caracteres',
  })
  @Transform(({ value }) => toTrimmedString(value))
  departamento!: string;

  @IsOptional()
  @IsString({ message: 'El código postal debe ser un texto' })
  @MaxLength(20, { message: 'El código postal no puede exceder 20 caracteres' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  codigoPostal?: string | null;

  @IsOptional()
  @IsBoolean({ message: 'El campo esPredeterminada debe ser un booleano' })
  esPredeterminada?: boolean;
}
