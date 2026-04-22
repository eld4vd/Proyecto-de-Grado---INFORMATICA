import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO para registro de nuevos clientes
 */
export class RegisterDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre!: string;

  @IsString({ message: 'El apellido debe ser texto' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  apellido!: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password!: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Formato de teléfono inválido' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  @Transform(({ value }) => value?.trim())
  telefono?: string;

  @IsOptional()
  @IsString({ message: 'El NIT/CI debe ser texto' })
  @MaxLength(20, { message: 'El NIT/CI no puede exceder 20 caracteres' })
  @Transform(({ value }) => value?.trim())
  nitCi?: string;
}
