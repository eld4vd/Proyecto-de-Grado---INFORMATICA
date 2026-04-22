import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO para actualizar perfil del usuario
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser texto' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  apellido?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @Matches(/^[0-9+\-\s()]+$/, {
    message:
      'El teléfono solo puede contener números, +, -, espacios y paréntesis',
  })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  telefono?: string;
}
