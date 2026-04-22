import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  toTrimmedString,
  toTrimmedStringOrNull,
} from '../../common/utils/transforms.util';

export class CreateClienteDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  @Transform(({ value }) => toTrimmedString(value))
  nombre!: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString({ message: 'El apellido debe ser un texto' })
  @MaxLength(255, { message: 'El apellido no puede exceder 255 caracteres' })
  @Transform(({ value }) => toTrimmedString(value))
  apellido!: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
  @Transform(({ value }) => toTrimmedString(value).toLowerCase())
  email!: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  @MaxLength(50, { message: 'El teléfono no puede exceder 50 caracteres' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  telefono?: string | null;

  @IsOptional()
  @IsString({ message: 'El NIT/CI debe ser un texto' })
  @MaxLength(50, { message: 'El NIT/CI no puede exceder 50 caracteres' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  nitCi?: string | null;
}
